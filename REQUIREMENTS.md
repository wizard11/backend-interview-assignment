## Requirements

As a service provider, we would like to add file versioning to the service with the following hard requirements:

- If a user re-uploads a file with same name but different contents in the parent, then a new file version is created and the previous contents are saved as an older version.
- If a user re-uploads a file with same name and same contents in the parent, then no action is taken.
- The user can see all the versions of a file.
- Deleting a file shall delete all versions of it.
- The download file API shall allow specifying a version to download. If no version is specified then the latest verion is downloaded.
- The end of month billing should now take into account all the different file versions. The user shall be charged for the storage space used by all their file versions.

## Task

As a software lead architect, your job is to come up with a low-level design which the development team can take and implement this feaure. You are free to use any means of communication - document, diagrams, illustrations, or just verbal explanation. Your solution will be judged based on the following criteria:

1. **Clarity of the communication** - are you able to clearly and precisely put your points across?
2. **Completeness of the solution** - are you able to capture and address all the complex points of the feature design?
3. **Design suitability** - is your design elegant and simple, yet robust and extendable?
