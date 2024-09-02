package main

import (
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"strconv" // Add the strconv package
	"strings"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

type Contract struct {
	Address               string `json:"address"`
	ChainID               string `json:"chain_id"`
	Name                  string `json:"name"`
	OwnerProject          string `json:"owner_project"`
	UsageCategory         string `json:"usage_category"`
	DeploymentTx          string `json:"deployment_tx"`
	DeployerAddress       string `json:"deployer_address"`
	DeploymentDate        string `json:"deployment_date"`
	VerifiedStatus        bool   `json:"verified_status"`
	IsProxyContract       bool   `json:"is_proxy_contract"`
	ProxyAddress          string `json:"proxy_address,omitempty"`
	ImplementationAddress string `json:"implementation_address,omitempty"`
	SourceRepoURL         string `json:"source_repo_url,omitempty"`
	OriginKey             string `json:"origin_key"`
}

type BlockscoutResponse struct {
	Address                 string `json:"address"`
	Name                    string `json:"name"`
	IsVerified              bool   `json:"is_verified"`
	IsFullyVerified         bool   `json:"is_fully_verified"`
	IsPartiallyVerified     bool   `json:"is_partially_verified"`
	IsVerifiedViaSourcify   bool   `json:"is_verified_via_sourcify"`
	SourcifyRepoURL         string `json:"sourcify_repo_url"`
	MinimalProxyAddressHash string `json:"minimal_proxy_address_hash"`
	CompilerVersion         string `json:"compiler_version"`
	EVMVersion              string `json:"evm_version"`
	Optimizer               string `json:"optimizer"`
	VerifiedAt              string `json:"verified_at"`
}

type ProcessingStats struct {
	TotalContracts    int    `json:"total_contracts"`
	ProcessedCount    int    `json:"processed_count"`
	ContractsWithName int    `json:"contracts_with_name"`
	ProxyContracts    int    `json:"proxy_contracts"`
	ElapsedTime       string `json:"elapsed_time"`
}

type wsMessage struct {
	messageType int
	data        []byte
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var contracts []Contract

var blockscoutAPIs = map[string]string{
	"optimism":      "https://optimism.blockscout.com/api/v2/smart-contracts/",
	"polygon_zkevm": "https://zkevm.blockscout.com/api/v2/smart-contracts/",
	"mode":          "https://explorer.mode.network/api/v2/smart-contracts/",
	"arbitrum":      "https://arbitrum.blockscout.com//api/v2/smart-contracts/",
	"zora":          "https://explorer.zora.energy/api/v2/smart-contracts/",
	"base":          "https://base.blockscout.com/api/v2/smart-contracts/",
	"zksync_era":    "https://zksync.blockscout.com/api/v2/smart-contracts/",
	"linea":         "https://explorer.linea.build/api/v2/smart-contracts/",
	"mantle":        "https://explorer.mantle.xyz/api/v2/smart-contracts/",
	"redstone":      "https://explorer.redstone.xyz/api/v2/smart-contracts/",
}

var chainIDMap = map[string]string{
	"optimism":      "eip155-10",
	"polygon_zkevm": "eip155-1101",
	"mode":          "eip155-34443",
	"arbitrum":      "eip155-42161",
	"zora":          "eip155-7777777",
	"base":          "eip155-8453",
	"zksync_era":    "eip155-324",
	"linea":         "eip155-59144",
	"mantle":        "eip155-5000",
	"redstone":      "eip155-17001",
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/upload", uploadCSVHandler).Methods("POST")
	r.HandleFunc("/contracts", getContractsHandler).Methods("GET")
	r.HandleFunc("/process", processContractsWebSocket)
	r.HandleFunc("/download-results", downloadResultsHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(r)

	fmt.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func downloadResultsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Disposition", "attachment; filename=processed_contracts.json")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contracts)
}

func processContractsWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading to WebSocket:", err)
		return
	}
	defer conn.Close()

	maxQueries, _ := strconv.Atoi(r.URL.Query().Get("max_queries"))

	// Create a channel for WebSocket messages
	wsChan := make(chan wsMessage, 100) // Buffered channel

	// Create a done channel to signal when to stop processing
	done := make(chan struct{})

	// Start a goroutine to handle WebSocket writes
	go func() {
		for {
			select {
			case msg, ok := <-wsChan:
				if !ok {
					return // wsChan has been closed, exit the goroutine
				}
				err := conn.WriteMessage(msg.messageType, msg.data)
				if err != nil {
					log.Println("Error writing to WebSocket:", err)
					close(done) // Signal to stop processing
					return
				}
			case <-done:
				return // Stop the goroutine if done channel is closed
			}
		}
	}()

	processedContracts, stats, err := processContracts(contracts, maxQueries, wsChan, done)
	if err != nil {
		log.Printf("Error processing contracts: %v", err)
		jsonError, _ := json.Marshal(map[string]string{"error": err.Error()})
		wsChan <- wsMessage{websocket.TextMessage, jsonError}
	} else {
		contracts = processedContracts
		jsonResult, _ := json.Marshal(map[string]interface{}{
			"message": fmt.Sprintf("Successfully processed %d contracts", len(processedContracts)),
			"stats":   stats,
		})
		wsChan <- wsMessage{websocket.TextMessage, jsonResult}
	}

	close(wsChan)
	<-done // Wait for the WebSocket writing goroutine to finish
}

func uploadCSVHandler(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic in uploadCSVHandler: %v", r)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
	}()

	log.Println("Received upload request")
	logRequestDetails(r)

	file, header, err := r.FormFile("file")
	if err != nil {
		logAndRespondWithError(w, fmt.Sprintf("Error getting form file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	log.Printf("Uploaded File: %s, Size: %d", header.Filename, header.Size)

	newContracts, err := processCSV(file)
	if err != nil {
		logAndRespondWithError(w, err.Error(), http.StatusBadRequest)
		return
	}

	contracts = newContracts

	log.Printf("Successfully processed %d contracts", len(newContracts))

	respondWithJSON(w, http.StatusOK, map[string]string{
		"message": fmt.Sprintf("CSV processed successfully. Processed %d contracts.", len(newContracts)),
	})
}

func getContractsHandler(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, contracts)
}

func processCSV(file io.Reader) ([]Contract, error) {
	reader := csv.NewReader(file)
	var newContracts []Contract

	header, err := reader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV header: %v", err)
	}

	log.Printf("CSV Headers: %v", header)

	encodeIndex, originKeyIndex, err := findColumnIndices(header)
	if err != nil {
		return nil, err
	}

	for lineNum := 2; ; lineNum++ {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("failed to read CSV at line %d: %v", lineNum, err)
		}

		if len(record) <= encodeIndex || len(record) <= originKeyIndex {
			return nil, fmt.Errorf("invalid record at line %d: %v", lineNum, record)
		}

		encode := record[encodeIndex]
		if !strings.HasPrefix(encode, "0x") {
			encode = "0x" + encode
		}

		contract := Contract{
			Address:   encode,
			OriginKey: record[originKeyIndex],
			ChainID:   record[originKeyIndex], // Set ChainID to OriginKey for now
		}
		newContracts = append(newContracts, contract)
	}

	return newContracts, nil
}

func findColumnIndices(header []string) (int, int, error) {
	encodeIndex, originKeyIndex := -1, -1
	for i, column := range header {
		columnLower := strings.ToLower(strings.TrimSpace(column))
		if columnLower == "encode" {
			encodeIndex = i
		} else if columnLower == "origin_key" {
			originKeyIndex = i
		}
	}

	if encodeIndex == -1 || originKeyIndex == -1 {
		return -1, -1, fmt.Errorf("CSV must contain 'encode' and 'origin_key' columns. Found indices: encode=%d, origin_key=%d", encodeIndex, originKeyIndex)
	}

	return encodeIndex, originKeyIndex, nil
}

func processContracts(contracts []Contract, maxQueries int, wsChan chan<- wsMessage, done <-chan struct{}) ([]Contract, ProcessingStats, error) {
	var processedContracts []Contract
	var mu sync.Mutex
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 10) // Limit concurrent goroutines
	errors := make(chan error, len(contracts))

	stats := ProcessingStats{
		TotalContracts: len(contracts),
	}

	startTime := time.Now()

	for i, contract := range contracts {
		if maxQueries > 0 && i >= maxQueries {
			break
		}
		wg.Add(1)
		go func(c Contract) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			processedContract, err := processContract(c)
			if err != nil {
				errors <- fmt.Errorf("error processing contract %s: %v", c.Address, err)
			}

			mu.Lock()
			processedContracts = append(processedContracts, processedContract)
			stats.ProcessedCount++
			if processedContract.Name != "" {
				stats.ContractsWithName++
			}
			if processedContract.IsProxyContract {
				stats.ProxyContracts++
			}
			stats.ElapsedTime = time.Since(startTime).String()
			mu.Unlock()

			// Send progress update
			select {
			case <-done:
				return // Stop processing if done channel is closed
			default:
				jsonStats, _ := json.Marshal(stats)
				wsChan <- wsMessage{websocket.TextMessage, jsonStats}
			}
		}(contract)
	}

	wg.Wait()
	close(errors)

	var errorMessages []string
	for err := range errors {
		errorMessages = append(errorMessages, err.Error())
	}

	if len(errorMessages) > 0 {
		return processedContracts, stats, fmt.Errorf("encountered errors while processing contracts: %s", strings.Join(errorMessages, "; "))
	}

	return processedContracts, stats, nil
}

func processContract(contract Contract) (Contract, error) {
	apiURL, ok := blockscoutAPIs[contract.OriginKey]
	if !ok {
		log.Printf("Unknown origin key for contract %s: %s", contract.Address, contract.OriginKey)
		return contract, nil
	}

	blockscoutData, err := fetchBlockscoutData(apiURL, contract.Address)
	if err != nil {
		if err == ErrContractNotFound {
			log.Printf("Contract not found on Blockscout for %s on %s", contract.Address, contract.OriginKey)
			return contract, nil
		}
		return contract, fmt.Errorf("error fetching Blockscout data: %v", err)
	}

	return mapBlockscoutToOpenLabels(contract, blockscoutData)
}

var ErrContractNotFound = errors.New("contract not found")

func fetchBlockscoutData(apiURL, address string) (BlockscoutResponse, error) {
	var blockscoutData BlockscoutResponse
	url := apiURL + address
	maxRetries := 3
	retryDelay := time.Second

	for i := 0; i < maxRetries; i++ {
		log.Printf("Fetching data from Blockscout API: %s", url)
		resp, err := http.Get(url)
		if err != nil {
			log.Printf("HTTP request failed: %v", err)
			time.Sleep(retryDelay)
			continue
		}
		defer resp.Body.Close()

		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Printf("Failed to read response body: %v", err)
			return blockscoutData, err
		}

		log.Printf("Blockscout API response status: %d", resp.StatusCode)
		log.Printf("Blockscout API response body: %s", string(body))

		if resp.StatusCode == http.StatusNotFound {
			return blockscoutData, ErrContractNotFound
		}

		if resp.StatusCode != http.StatusOK {
			log.Printf("API request failed with status: %d", resp.StatusCode)
			time.Sleep(retryDelay)
			continue
		}

		err = json.Unmarshal(body, &blockscoutData)
		if err != nil {
			log.Printf("Failed to unmarshal JSON: %v", err)
			return blockscoutData, err
		}

		return blockscoutData, nil
	}

	return blockscoutData, fmt.Errorf("failed to fetch data after %d retries", maxRetries)
}

func mapBlockscoutToOpenLabels(contract Contract, blockscoutData BlockscoutResponse) (Contract, error) {
	contract.Name = blockscoutData.Name
	contract.VerifiedStatus = blockscoutData.IsVerified || blockscoutData.IsFullyVerified || blockscoutData.IsPartiallyVerified || blockscoutData.IsVerifiedViaSourcify
	contract.SourceRepoURL = blockscoutData.SourcifyRepoURL

	// Set proxy and implementation addresses

	contract.IsProxyContract = blockscoutData.MinimalProxyAddressHash != ""
	contract.ProxyAddress = blockscoutData.MinimalProxyAddressHash
	contract.ImplementationAddress = blockscoutData.MinimalProxyAddressHash // This might need to be adjusted based on actual Blockscout response
	if !contract.IsProxyContract {
		nameLower := strings.ToLower(contract.Name)
		if strings.Contains(nameLower, "proxy") || strings.Contains(nameLower, "erc1967") {
			contract.IsProxyContract = true
		}
	}

	// Update ChainID based on origin key

	if chainID, ok := chainIDMap[contract.OriginKey]; ok {
		contract.ChainID = chainID
	}

	// Parse and format deployment date
	if blockscoutData.VerifiedAt != "" {
		parsedTime, err := time.Parse(time.RFC3339, blockscoutData.VerifiedAt)
		if err == nil {
			contract.DeploymentDate = parsedTime.Format("2006-01-02 15:04:05")
		}
	}

	// Note: owner_project, usage_category, deployment_tx, and deployer_address
	// are not directly available in the Blockscout response and may need to be
	// set manually or inferred from other data

	return contract, nil
}

func logRequestDetails(r *http.Request) {
	log.Printf("Content-Type: %s", r.Header.Get("Content-Type"))
	log.Printf("Content-Length: %s", r.Header.Get("Content-Length"))
}

func logAndRespondWithError(w http.ResponseWriter, message string, statusCode int) {
	log.Printf("Error: %s", message)
	http.Error(w, message, statusCode)
}

func respondWithJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}
