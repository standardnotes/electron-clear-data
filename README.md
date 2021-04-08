# electron-clear-data

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Clears user data for your electron application.

## Why?

Electron applications are web applications running in the Chromium engine. The Chromium engine uses [leveldb](https://github.com/google/leveldb) under the hood to store IndexedDB, Local Storage, and Session Storage data. Each one of these is stored in a database. A database is represented by a set of files stored in a directory. Below is an example of a `leveldb` database:

```
Local Storage/
└── leveldb
    ├── 000003.log
    ├── CURRENT
    ├── LOCK
    ├── LOG
    └── MANIFEST-000001
```

### Log files

> A log file (*.log) stores a sequence of recent updates. Each update is appended to the current log file. When the log file reaches a pre-determined size (approximately 4MB by default), it is converted to a sorted table and a new log file is created for future updates.

### Sorted tables

> A sorted table (*.ldb) stores a sequence of entries sorted by key. Each entry is either a value for the key or a deletion marker for the key. (Deletion markers are kept around to hide obsolete values present in older sorted tables).

### Manifest

> A MANIFEST file lists the set of sorted tables that make up each level, the corresponding key ranges, and other important metadata. A new MANIFEST file (with a new number embedded in the file name) is created whenever the database is reopened. The MANIFEST file is formatted as a log, and changes made to the serving state (as files are added or removed) are appended to this log.

### Current

> CURRENT is a simple text file that contains the name of the latest MANIFEST file.

### Info logs

> Informational messages are printed to files named LOG and LOG.old.

See [leveldb implementation](https://github.com/google/leveldb/blob/master/doc/impl.md) for a more detailed implementation document.

---

Our main interests here are the [Log files](###log-files) and [Sorted tables](###sorted-tables). These files are not deleted when the Local Storage is cleared because `electron` is using the same database over and over again. This may expose information from previous sessions, which is not ideal.

Additionally, if you uninstall the electron application from your system, this information is not deleted either.

If you want to clear or delete this information when creating a new session or uninstalling the application, just delete the user data directory and relaunch the application, which is basically what this package does :smile:

## Installation

To install, run:

```bash
yarn add electron-clear-data
```

Or:

```bash
npm install electron-clear-data
```

## Usage

```javascript
import { clearUserData } from 'electron-clear-data';

...

clearUserData();
```

## Contributing

1. Fork this repo
1. Create your feature branch: `git checkout -b feat/my-feature`
1. Code your feature
1. Add your changes: `git add .`
1. Commit your changes: `git commit -am 'feat: my feature'`
1. Push the branch `git push origin feat/my-feature`
1. Submit a pull request

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).