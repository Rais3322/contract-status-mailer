const MissingProperyError = require('./db_errors');
const { insertNewRecords, writeDBData, readTable, updateRecords } = require('./db_helpers');
const fs = require('fs');

describe('readTable:', () => {
	let dbFile = {
		"employees": [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			}
		]
	};

	test('should return required tables from db correctly', async () => {
		let employeesExp = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			}
		];

		let employeesResult = await readTable(dbFile, 'employees');

		expect(employeesResult).toEqual(employeesExp);
	});

	test('should throw MissingProperyError if the table is missing in db', async () => {
		let dbEmpty = {};

		await expect(readTable(dbEmpty, 'employees')).rejects.toThrowError(MissingProperyError);
	});
});

describe('insertNewRecords:', () => {
	test('should insert new records in required table with single key', async () => {
		let dbFile = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				},
				{
					"name": "employee3",
					"status": "fired"
				}
			]
		};
		let employeesNew = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			},
			{
				"some new employees data": "new employees data"
			},
			{
				"name": "employee3",
				"status": "fired"
			}
		];

		await insertNewRecords(dbFile, 'employees', employeesNew, 'name');

		expect(dbFile['employees']).toEqual(expect.arrayContaining(employeesNew));
	});

	test('should insert new records in required table with key pair', async () => {
		let dbFile = {
			"employees": [
				{
					"id": "1",
					"name": "employee1",
					"status": "hired"
				}, 
				{
					"id": "2",
					"name": "employee3",
					"status": "fired"
				},
				{
					"id": "3",
					"name": "employee2",
					"status": "hired"
				}
			]
		};
		let employeesNew = [
			{
				"id": "1",
				"name": "employee1",
				"status": "hired"
			}, 
			{
				"id": "2",
				"name": "employee2",
				"status": "fired"
			},
			{
				"id": "4",
				"name": "employee2",
				"status": "hired"
			},
			{
				"id": "3",
				"name": "employee3",
				"status": "hired"
			}
		];

		await insertNewRecords(dbFile, 'employees', employeesNew, 'name', 'id');

		expect(dbFile['employees']).toEqual(expect.arrayContaining(employeesNew))
	})

	test('should insert whole new table if that table is missing', async () => {
		let dbFile = {
			"employees": []
		};
		let employeesNew = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			},
			{
				"some new employees data": "new employees data"
			},
			{
				"name": "employee3",
				"status": "fired"
			}
		];

		await insertNewRecords(dbFile, 'employees', employeesNew, 'name');

		expect(dbFile['employees']).toStrictEqual(employeesNew);
	});

	test('should not change db if data is missing', async () => {
		let dbFile = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				},
				{
					"name": "employee3",
					"status": "fired"
				}
			]
		};
		let dbSaved = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				},
				{
					"name": "employee3",
					"status": "fired"
				}
			]
		};
		let emptyData = [];

		await insertNewRecords(dbFile, 'employees', emptyData, 'name');

		expect(dbFile).toEqual(dbSaved);
	})

	test('should not change other fields in db', async () => {
		let dbFile = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				}
			],
			"tasks": [
				{
					"name": "task1",
					"status": "in progress",
					"archived": false
				},
				{
					"name": "task2",
					"status": "done",
					"archived": true
				},
				{
					"name": "task3",
					"status": "failed",
					"archived": true
				}
			]
		};
		let employeesNew = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			},
			{
				"some new employees data": "new employees data"
			}
		];
		let tasksOrig = dbFile['tasks'];

		await insertNewRecords(dbFile, 'employees', employeesNew, 'name');

		expect(dbFile.tasks).toEqual(tasksOrig);
	});

	test('should throw an error if the table is missing in db', async () => {
		let dbEmpty = {};
		let employeesNew = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			},
			{
				"some new employees data": "new employees data"
			}
		];

		await expect(insertNewRecords(dbEmpty, 'employees', employeesNew, 'name')).rejects.toThrowError();
	});
});

describe('updateRecords:', () => {
	test('should rewrite whole record if it has changed', async () => {
		let dbFile = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				},
				{
					"name": "employee3",
					"status": "fired"
				}
			]
		};
		let employeesNew = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "hired"
			},
			{
				"name": "employee3",
				"status": "fired"
			}
		];

		await updateRecords(dbFile, 'employees', employeesNew, 'name');

		expect(dbFile['employees']).toStrictEqual(employeesNew);
	});

	test('should not change db if data is missing', async () => {
		let dbFile = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				},
				{
					"name": "employee3",
					"status": "fired"
				}
			]
		};
		let dbSaved = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				},
				{
					"name": "employee3",
					"status": "fired"
				}
			]
		};
		let emptyData = [];

		await updateRecords(dbFile, 'employees', emptyData, 'name');

		expect(dbFile).toEqual(dbSaved);
	})

	test('should not change other fields in db', async () => {
		let dbFile = {
			"employees": [
				{
					"name": "employee1",
					"status": "hired"
				},
				{
					"name": "employee2",
					"status": "fired"
				}
			],
			"tasks": [
				{
					"name": "task1",
					"status": "in progress",
					"archived": false
				},
				{
					"name": "task2",
					"status": "done",
					"archived": true
				},
				{
					"name": "task3",
					"status": "failed",
					"archived": true
				}
			]
		};
		let employeesNew = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			},
			{
				"some new employees data": "new employees data"
			}
		];
		let tasksOrig = dbFile['tasks'];

		await updateRecords(dbFile, 'employees', employeesNew, 'name');

		expect(dbFile.tasks).toEqual(tasksOrig);
	});

	test('should throw an error if the table is missing in db', async () => {
		let dbEmpty = {};
		let employeesNew = [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			},
			{
				"some new employees data": "new employees data"
			}
		];

		await expect(updateRecords(dbEmpty, 'employees', employeesNew, 'name')).rejects.toThrowError();
	});
});

describe('writeDBData:', () => {
	let dbFile = {
		"employees": [
			{
				"name": "employee1",
				"status": "hired"
			},
			{
				"name": "employee2",
				"status": "fired"
			}
		]
	};
	
	beforeEach(() => {
		fs.writeFileSync('test.json', '');
	});

	afterAll(() => {
		fs.unlinkSync('test.json');
	});

	test('should write db into JSON', async () => {
		await writeDBData(dbFile, 'test.json');

		const fileContent = fs.readFileSync('test.json');
		const parsedContent = JSON.parse(fileContent);

		expect(parsedContent).toEqual(dbFile);
	});

	test('should create JSON file if it is missing', async () => {
		fs.unlinkSync('test.json');

		await writeDBData(dbFile, 'test.json');

		const fileExists = await fs.promises.access('test.json')
		.then(() => true)
		.catch(() => false);

		expect(fileExists).toBe(true);
	});

	test('should write db into JSON even if it is missing', async () => {
		fs.unlinkSync('test.json');

		await writeDBData(dbFile, 'test.json');

		const fileContent = fs.readFileSync('test.json');
		const parsedContent = JSON.parse(fileContent);

		expect(parsedContent).toEqual(dbFile);
	});
});