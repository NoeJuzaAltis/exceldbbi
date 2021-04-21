# exceldbbi
Excel -> DB connection, upload data to DB whenever Excel file updated
## Prerequisites
`npm install`
`(local) mongodb without auth (trusted network)`
### Files you may want to create
`.env` <- with the environement variables (app restart required)
```
ADMINUSR=youradminuser
ADMINPASS=youradminpassword
```
`authsessions.json` <- if you want to pre-define some authenticated sessions (app restart required)
```
[
  {"id":"yourPreDefinedId1"},
  {"id":"yourPreDefinedId2"},
  {"id":"etc..."}
]
```
`conf.json` <- Configuration file if you want to pre-define what is set up in the graphic interface (app restart required)
```
{
  "host": "mongodb://localhost:27017/",
  "endpoint": "biExports",
  "extension": "xlsm",
  "sheetstoscan": [
    "sheet1",
    "sheet2",
    "etc..."
  ],
  "exportnames": [
    "exp1",
    "exp2",
    "etc..."
  ]
}
```
## DATA FORMAT IN THE EXCEL SHEET
the data in your export sheet should look like this :
|  name1  |  name2  |  name3  |  name4  | etc... |
| ---     | ---     | ---     | ---     | ----   |
| value01 | value02 | value03 | value04 | etc... |
| value11 | value12 | value13 | value14 | etc... |
