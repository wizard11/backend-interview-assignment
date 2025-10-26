# Dropbox-like File Management Service

A NestJS-based backend service that provides Dropbox-like functionality including file storage, folder organization, user groups, and file sharing capabilities.

## Requirements

As a service provider, we would like to add file versioning to the service with the following requirements:

- If a user re-uploads a file with same name but different contents, then a new file version is created and the previous contents are saved as an older version.
- If a user re-uploads a file with same name and same contents, then no action is taken.
- Deleting a file shall delete all versions of it
- The download file API shall allow specifying a version to download. If no version is specified then the latest verion is downloaded.
- The end of month billing should now take into account all the different file versions. The user shall be charged for the storage space used by all their file versions.
