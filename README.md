# Map Colonies Heartbeat Management Service

----------------------------------

![badge-alerts-lgtm](https://img.shields.io/lgtm/alerts/github/MapColonies/heartbeat-manager?style=for-the-badge)

![grade-badge-lgtm](https://img.shields.io/lgtm/grade/javascript/github/MapColonies/heartbeat-manager?style=for-the-badge)

![snyk](https://img.shields.io/snyk/vulnerabilities/github/MapColonies/heartbeat-manager?style=for-the-badge)

----------------------------------

## Service info
This service is heartbeat server used to log the last heartbeat for worker of a specific task.
A list of tasks that didn't received new heartbeat pulse for specified duration can then be retrieved and used by other services
## API
Checkout the OpenAPI spec [here](/openapi3.yaml)

## Installation

Install deps with npm

```bash
npm install
```

## Run Locally

Clone the project

```bash

git clone https://github.com/MapColonies/heartbeat-manager

```

Go to the project directory

```bash

cd heartbeat-manager

```

Install dependencies

```bash

npm install

```

Start the server

```bash

npm run start

```

## Running Tests

To run tests, run the following command

```bash

npm run test

```

To only run unit tests:
```bash
npm run test:unit
```

To only run integration tests:
```bash
npm run test:integration
```

## Running Migration Docker

To run the migration docker run the following command:

```bash

 docker run -it -e DB_USER=postgres  -e DB_PASSWORD=1234 -e DB_NAME=postgres -e DB_TYPE=postgres -e DB_HOST=localhost -e DB_PORT=5432 -e DB_SCHEMA=HeartbeatManager --rm --network host migration-image:vtag

```


