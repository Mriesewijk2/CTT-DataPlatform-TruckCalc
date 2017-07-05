# CTT-DataPlatform-TruckCalc
A first version of the CTT dataplatform which will be used to support decision making within CTT

## Requirements
- Meteor
- External Mongodb (recommended)
- Grunt-cli (for easier imports)

## Installation
- Install MongoDB
- Clone repo (https://github.com/Mriesewijk2/CTT-DataPlatform-TruckCalc.git)
- Cd to the repo
- Make sure mongo server is running (run mongod command)
- Specify the MongoDB credentials in config/parameters.json
- Import the data
  - Files in CSV format
    - mongoimport -d {{ database_name }} -c {{collection_name}} --type csv --file {{ path/to/file.csv }}
  - Files in JSON format
    - Provide the needed JSON files for MetaContainer
- Command: `grunt mongoimport`
- Command: `meteor` with the added credentials for the MetaContainer
