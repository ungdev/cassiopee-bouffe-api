# Cassiopée Bouffe API

[![Build Status](https://github.com/ungdev/cassiopee-bouffe-api/actions/workflows/ci.yml/badge.svg)](https://github.com/ungdev/cassiopee-bouffe-api/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ungdev/cassiopee-bouffe-api/branch/master/graph/badge.svg)](https://codecov.io/gh/ungdev/cassiopee-bouffe-api)

API web à destination des services de la bouffe de cassiopée

## Requirements

- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/)

## Installation

```
git clone git@github.com:ungdev/cassiopee-bouffe-api.git
# or
git clone https://github.com/ungdev/cassiopee-bouffe-api.git

cd cassiopee-bouffe-api

# Install all the dependencies
yarn
```

Then, connect to your database (MySQL/MariaDB) and enter

```
CREATE DATABASE bouffe CHARACTER SET utf8;
```

Create the tables

```
DATABASE_URL="mysql://user:password@localhost/bouffe" yarn prisma db push --preview-feature
```

Generate the prisma client (redo this command when you update schema.prisma)

```
yarn prisma generate
```

## Configuration

Copy the file .env.example to .env and then edit it with your values :

```
cp .env.example .env
```
