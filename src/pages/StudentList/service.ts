import request from '@/utils/request';
import type { StudentParams, StudentListParams } from './data.d.ts';

// 查询学员列表
export async function listStudent(params: StudentListParams) {
  return request('/express-api/student/getStudentList', {
    method: 'GET',
    params,
  });
}

// 查询学员详细
export async function getStudent(id: string) {
  return request(`/express-api/student/getStudentById/${id}`, {
    method: 'GET',
  });
}

// 新增学员
export async function addStudent(data: StudentParams) {
  return request('/express-api/student/createStudent', {
    method: 'POST',
    data,
  });
}

// 修改学员
export async function updateStudent(data: StudentParams) {
  return request(`/express-api/student/updateStudentById/${data._id}`, {
    method: 'PUT',
    data,
  });
}

// 删除学员
export async function delStudent(id: string) {
  return request(`/express-api/student/deleteStudentById/${id}`, {
    method: 'DELETE',
  });
}
