import { Repository, ObjectType, ObjectLiteral } from 'typeorm';

//functions
const getCustomRepositoryMock = jest.fn();
const createConnection = jest.fn();
const inMock = jest.fn();
const lessThanMock = jest.fn();

let repositories: {
  [key: string]: unknown;
};

const initTypeOrmMocks = (): void => {
  repositories = {};
  getCustomRepositoryMock.mockImplementation(<T>(key: ObjectType<T>) => {
    return repositories[key.name];
  });
  createConnection.mockReturnValue({
    getCustomRepository: getCustomRepositoryMock,
  });
};

interface QueryBuilder {
  where: jest.Mock;
  orderBy: jest.Mock;
  getMany: jest.Mock;
  update: jest.Mock;
  set: jest.Mock;
  returning: jest.Mock;
  updateEntity: jest.Mock;
  execute: jest.Mock;
}

interface RepositoryMocks {
  findOneMock: jest.Mock;
  findMock: jest.Mock;
  saveMock: jest.Mock;
  deleteMock: jest.Mock;
  removeMock: jest.Mock;
  countMock: jest.Mock;
  queryBuilderMock: jest.Mock;
  queryBuilder: QueryBuilder;
  queryMock: jest.Mock;
}

const registerRepository = <T>(key: ObjectType<T>, instance: T): RepositoryMocks => {
  const repo = instance as unknown as Repository<ObjectLiteral>;
  const mocks = {
    findOneMock: jest.fn(),
    findMock: jest.fn(),
    saveMock: jest.fn(),
    deleteMock: jest.fn(),
    removeMock: jest.fn(),
    countMock: jest.fn(),
    queryBuilderMock: jest.fn(),
    queryBuilder: {
      where: jest.fn(),
      orderBy: jest.fn(),
      getMany: jest.fn(),
      update: jest.fn(),
      set: jest.fn(),
      returning: jest.fn(),
      updateEntity: jest.fn(),
      execute: jest.fn(),
    },
    queryMock: jest.fn(),
  };
  repo.findOne = mocks.findOneMock;
  repo.find = mocks.findMock;
  repo.save = mocks.saveMock;
  repo.delete = mocks.deleteMock;
  repo.remove = mocks.removeMock;
  repo.count = mocks.countMock;
  (repo.createQueryBuilder as unknown) = mocks.queryBuilderMock;
  repo.query = mocks.queryMock;

  // Set query builder mocks
  mocks.queryBuilderMock.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.where.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.orderBy.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.update.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.set.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.returning.mockImplementation(() => mocks.queryBuilder);
  mocks.queryBuilder.updateEntity.mockImplementation(() => mocks.queryBuilder);

  repositories[key.name] = repo;
  return mocks;
};

//decorator mocks
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const Generated = () => jest.fn();

//interfaces
export { RepositoryMocks };
//initializers
export { registerRepository, initTypeOrmMocks };
//mocks
export { createConnection, inMock as In, inMock, lessThanMock as LessThan, lessThanMock };
//decorator mocks
export { Generated };
