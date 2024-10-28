> [!CAUTION]
> **ARCHIVED** Checkout [GoMaluum](https://github.com/nrmnqdds/gomaluum-api) for latest version

# Welcome to i-Ma'luum Backend 🌟

<img src="https://github.com/nrmnqdds/simplified-imaluum/assets/65181897/2ad4fedc-1018-4779-b94a-5aae6f2944a3" width=100 />

## 🚧 **In Construction** 🚧
> [!IMPORTANT]
> This project is **not** associated with the official i-Ma'luum!

> [!CAUTION]
> **Not stable yet**
> 
> If not working, try do it other time, later at night or anything

Support this project!

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/gbraad)

A backend REST API for my infamous [Simplified i-Ma'luum](https://github.com/nrmnqdds/simplified-imaluum). Aims to improvise the performance of the scraper as Next.js server actions didn't do well in bulk parallel fetching.


# Local installation
```
npm install
npm run dev
```
# REST API
The following are guides for this api usage.

## Authentication
### Request
`POST /login`
```
curl -i -X POST -H "Content-Type: application/json" -d '{"username": "matricnumber", "password": "yourpassword" }' http://localhost:3000/login
```
### Response
```
HTTP/1.1 200 OK
access-control-allow-origin: *
content-type: application/json; charset=UTF-8
set-cookie: MOD_AUTH_CAS=2u381j8ed1h9ghd178dg2313; Path=/; Expires=Wed, 24 Jan 2024 12:01:53 GMT
content-length: 1592
Date: Wed, 24 Jan 2024 11:51:53 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{
  "success": true,
  "matricNo": "2214227",
  "cookies": [
    {
      "key": "SESSION",
      "value": "jd39j081jakajdoiajdia"
    },
    {
      "key": "TGC",
      "value": "2u10eu18eh1d8hd8jdiadja"
    },
    {
      "key": "MOD_AUTH_CAS",
      "value": "2u381j8ed1h9ghd178dg2313"
    }
  ]
}
```


## Schedule
### Request
`GET /schedule`
```
curl -i -H 'Acceptt: application/json' -H 'Cookie: MOD_AUTH_CAS=2d64c989f859e7865be7a112cec428b6' http://localhost:3000/schedule 
```
### Response
```
HTTP/1.1 200 OK
access-control-allow-origin: *
content-type: application/json; charset=UTF-8
content-length: 6258
Date: Wed, 24 Jan 2024 12:02:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{
  "success": true,
  "data": {
  "success": true,
  "data": [
    {
      "schedule": [
        {
          "id": "MATH 1310-13-1",
          "courseCode": "MATH 1310",
          "courseName": "ENGINEERING MATHEMATICS 1",
          "section": "13",
          "chr": "3",
          "timestamps": [
            {
              "start": "08:30:00+08:00",
              "end": "09:50:00+08:00",
              "day": 4
            }
          ],
          "venue": "ENG LRM E2-1-1",
          "color": "",
          "lecturer": "HANISAH BINTI MANSHOR"
        },
        {
          "id": "MCTA 1231-2-0",
          "courseCode": "MCTA 1231",
          "courseName": "FUNDAMENTALS OF FLUID MECHANICS",
          "section": "2",
          "chr": "2",
          "timestamps": [
            {
              "start": "15:30:00+08:00",
              "end": "17:20:00+08:00",
              "day": 2
            }
          ],
          "venue": "ENG LRM E2-2-4",
          "color": "",
          "lecturer": "FARAHIYAH BINTI JASNI"
        }
    ]
}
```

For subjects that are held more than once a week, it will return something like this:
```
{
  "id": "MATH 1310-13-0",
  "courseCode": "MATH 1310",
  "courseName": "ENGINEERING MATHEMATICS 1",
  "section": "13",
  "chr": "3",
  "timestamps": [
    {
      "start": "08:30:00+08:00",
      "end": "09:50:00+08:00",
      "day": 2
    }
  ],
  "venue": "ENG LRM E2-1-1",
  "color": "",
  "lecturer": "HANISAH BINTI MANSHOR"
},
{
  "id": "MATH 1310-13-1",
  "courseCode": "MATH 1310",
  "courseName": "ENGINEERING MATHEMATICS 1",
  "section": "13",
  "chr": "3",
  "timestamps": [
    {
      "start": "08:30:00+08:00",
      "end": "09:50:00+08:00",
      "day": 4
    }
  ],
  "venue": "ENG LRM E2-1-1",
  "color": "",
  "lecturer": "HANISAH BINTI MANSHOR"
},
```

