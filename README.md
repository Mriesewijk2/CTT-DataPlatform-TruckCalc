# CTT-DataPlatform-TruckCalc
A first version of the CTT dataplatform which will be used to support decision making within CTT

## Requirements
- Meteor
- External Mongodb (recommended)
- Grunt-cli (for easier imports)

## Installation

- Clone repo
- `cd path/to/repo`
- `meteor npm install` to install the node_modules
- specify credentials for database in config/parameters.json
- provide needed json import files in config/fixtures
- `grunt mongoimport`
- `meteor` (with specified external database if needed)
