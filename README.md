# UI/UX Functions of the App

## 1. Contract Management and Interaction
- **Contract Selection**: Allows users to select a contract from a list of unlabeled contracts, which then updates the UI with relevant contract details.
- **Verify Contracts Button**: Enables the verification of contracts by fetching and displaying verification information like the contract name, verification status, and source code.
- **Display Contract Details**: Displays detailed information about a selected contract, including its address, contract name, and other metadata.

## 2. Chain Selection
- **Chain ID Selection Dropdown**: Allows users to select a blockchain network (e.g., Arbitrum, Optimism, Base) to view and manage contracts associated with that network.
- **Dynamic Contract Loading**: Based on the selected chain ID, the app dynamically fetches and displays contracts specific to that chain.

## 3. Source Code and Analysis Tools
- **Source Code Display**: Shows the source code of a selected contract, allowing users to review the code directly within the app.
- **Copy to Clipboard**: Provides a button to copy the displayed source code to the clipboard for easy sharing or analysis.
- **GitHub Search Button**: Opens a GitHub search page for the selected contract's address, allowing users to find related code on GitHub.
- **Explorer Button**: Opens a blockchain explorer (e.g., Etherscan, Arbiscan) for the selected contract, providing users with direct access to on-chain data.
- **Dedaub Lookup Button**: Opens Dedaub's analysis tool for the selected contract, offering deeper insights into contract behavior.
- **Google Search Button**: Opens a Google search for the selected contract address, enabling users to find additional information on the web.

## 4. Labeling and Categorization
- **Labeling Form**: Provides a form for users to label contracts with specific metadata such as owner project, usage category, and contract name.
- **Dynamic Dropdowns for Projects and Categories**: Searchable dropdowns for selecting or filtering projects and categories, allowing for easy assignment of labels to contracts.
- **Submit Button**: Submits the labeling information to Airtable, updating the contract's metadata in the database.

## 5. UX Enhancements
- **Loading Spinner**: Indicates loading status while data is being fetched or when a process (e.g., contract verification) is running.
- **Tooltip for Long Contract Names**: Shows a tooltip with the full contract name when the user hovers over a truncated contract name, ensuring full visibility of the information without cluttering the UI.
- **Table Sorting**: Allows users to sort contract data in the table by various columns (e.g., Gas (ETH), Transaction Count) for easier navigation and analysis.
- **Table Pagination or Scrolling**: The table component supports scrolling for long lists of contracts, ensuring a clean and navigable UI even with large datasets.
- **Error Handling and Feedback**: Provides feedback to the user when errors occur, such as failed data fetching, and updates the UI to reflect the error state.

## 6. Event Handling and Interaction
- **Click Outside to Close Dropdowns**: Closes dropdown menus when the user clicks outside of them, ensuring a clean and user-friendly experience.
- **Interactive Buttons**: Buttons for various actions (e.g., verifying contracts, fetching source code) that change states or trigger events when clicked, improving interactivity and responsiveness.

## 7. Dynamic Data Management
- **Auto Refresh Contracts Table**: Refreshes the contracts table when new data is submitted or when the chain ID is changed, ensuring the UI always displays the most up-to-date information.
- **Chain Overview**: Displays a summary of unlabeled transactions per chain, providing users with a high-level overview of the contract landscape on different networks.


# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
