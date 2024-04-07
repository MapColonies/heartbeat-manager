import config from 'config';
import { IDbConfig } from '../../../src/common/interfaces';
import { initConnection } from '../../../src/DAL/utils/createConnection';

export default async (): Promise<void> => {
  const dataSourceOptions = config.get<IDbConfig>('typeOrm');
  const connection = await initConnection(dataSourceOptions);
  const schema = dataSourceOptions.schema !== undefined ? `"${dataSourceOptions.schema}"` : 'public';
  if (schema !== 'public') {
    await connection.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  }
  await connection.destroy();
};
