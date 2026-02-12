export type StudentParams = {
  _id?: string;
  name: string;
  sex: boolean;
  birth: string;
  phone: string;
  bro: string;
  createTime?: string;
}

export type StudentListParams = {
  pageIndex?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
}

export type StudentListResult = {
  data: Student[];
  total: number;
  success: boolean;
}