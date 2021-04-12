# electron-clear-data

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Securely clears user data for your Electron application.

## Why?

Electron applications are web applications running in the Chromium engine. The Chromium engine uses [leveldb](https://github.com/google/leveldb) under the hood to store IndexedDB, localStorage, and Session Storage data. Each one of these is stored in a database. A database is represented by a set of files stored in a directory. Below is an example of a `leveldb` database:

```
Local Storage/
└── leveldb
    ├── 000003.log
    ├── CURRENT
    ├── LOCK
    ├── LOG
    └── MANIFEST-000001
```

Our main interests here are the [Log files](###log-files) and [Sorted tables](###sorted-tables). These files, which contain a log of updates made to localStorage and IndexedDB, including key/values in plaintext, are not deleted when localStorage or IndexedDB is cleared. _This may expose private information from previous sessions, which is a security hazard._

In addition, even deleting records from IndexedDB does not remove those records from the log file. Please see [this open issue](https://github.com/google/leveldb/issues/783) on the leveldb repo for more.

The only sure-fire way to clear sensitive data that was once written to localStorage or IndexedDB is to delete the underlying files manually, and restart the application so that these files are recreated. This is precisely what this package does.

The core code involved in this package is not difficult to write yourself. However, it can be difficult to do safely, and to ascertain the correctness of your code. For this reason we've created this package to be as safe and reliable as possible. We've composed tests that ensure this functionality always works as you would expect and does not regress. The code is written in TypeScript to maximize compile-time safety. We'll also keep this package up to date with other Electron data-related vulnerabilities as and when they are discovered.

---

## leveldb files

Each database is represented by a set of files stored in a directory. There are several different types of files as documented below (all of which will be deleted by `electron-clear-data`):

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

* To delete the entire user data directory:

```javascript
import { clearUserDataDirectory } from 'electron-clear-data';

...

clearUserDataDirectory();
```

---

* To delete [leveldb](##leveldb-files) files only, from the user data directory:

```javascript
import { clearLevelDbDirectories } from 'electron-clear-data';

...

clearLevelDbDirectories();
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
