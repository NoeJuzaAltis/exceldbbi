[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
# exceldbbi
Excel -> DB connection, upload data to DB whenever Excel file updated
##Install
```
git clone https://github.com/NoeJuzaAltis/exceldbbi.git
```
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
### DATA FORMAT IN THE EXCEL SHEET(S)
the data in your export sheet(s) should look like this :
|  name1  |  name2  |  name3  |  name4  | etc... |
| ---     | ---     | ---     | ---     | ----   |
| value01 | value02 | value03 | value04 | etc... |
| value11 | value12 | value13 | value14 | etc... |

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/NoeJuzaAltis/exceldbbi.svg?style=for-the-badge
[contributors-url]: https://github.com/NoeJuzaAltis/exceldbbi/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/NoeJuzaAltis/exceldbbi.svg?style=for-the-badge
[forks-url]: https://github.com/NoeJuzaAltis/exceldbbi/network/members
[stars-shield]: https://img.shields.io/github/stars/NoeJuzaAltis/exceldbbi.svg?style=for-the-badge
[stars-url]: https://github.com/NoeJuzaAltis/exceldbbi/stargazers
[issues-shield]: https://img.shields.io/github/issues/NoeJuzaAltis/exceldbbi.svg?style=for-the-badge
[issues-url]: https://github.com/NoeJuzaAltis/exceldbbi/issues
[license-shield]: https://img.shields.io/github/license/NoeJuzaAltis/exceldbbi.svg?style=for-the-badge
[license-url]: https://github.com/NoeJuzaAltis/exceldbbi/blob/main/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/no%C3%A9-juzan-a3aa88210
