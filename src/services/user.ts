import requestOld from '@/utils/request-mock';

export async function query(): Promise<any> {
  return requestOld('/api/users');
}

export async function queryCurrent(): Promise<any> {
  return requestOld('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return requestOld('/api/notices');
}
