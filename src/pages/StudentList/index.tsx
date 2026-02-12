import React, { useState, useRef } from 'react';
import moment from 'moment';
import type { Moment } from 'moment';
import { Button, message, DatePicker, Select, Space, Modal, Form, Input } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { StudentParams } from './data.d';
import { listStudent, addStudent, updateStudent, delStudent } from './service';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StudentManagement: React.FC = () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [currentRow, setCurrentRow] = useState<StudentParams | undefined>();
  const [dateType, setDateType] = useState<number>(0);
  const [month, setMonth] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string[]>([]);

  // 清空查询条件
  const handleReset = () => {
    setDateType(0);
    setMonth(null);
    setDate(null);
    setTimeRange([]);
    actionRef.current?.reload();
  };

  // 日期类型变化
  const handleDateTypeChange = (value: number) => {
    setDateType(value);
    setMonth(null);
    setDate(null);
    setTimeRange([]);
  };

  // 月份变化
  const handleMonthChange = (value: Moment | null) => {
    setMonth(value ? value.format('YYYY-MM') : null);
  };

  // 日期变化
  const handleDateChange = (value: Moment | null) => {
    setDate(value ? value.format('YYYY-MM-DD') : null);
  };

  // 时间范围变化
  const handleTimeRangeChange = (dates: [Moment, Moment] | null) => {
    if (dates && dates[0] && dates[1]) {
      setTimeRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    } else {
      setTimeRange([]);
    }
  };

  // 查询
  const handleSearch = () => {
    let startTime = '';
    let endTime = '';

    if (dateType === 0 && month) {
      startTime = moment(month).subtract(18, 'years').startOf('month').format('YYYY-MM-DD');
      endTime = moment(month).subtract(18, 'years').endOf('month').format('YYYY-MM-DD');
    } else if (dateType === 1 && date) {
      startTime = moment(date).subtract(18, 'years').format('YYYY-MM-DD');
      endTime = moment(date).subtract(18, 'years').format('YYYY-MM-DD');
    } else if (dateType === 2 && timeRange.length === 2) {
      startTime = moment(timeRange[0]).subtract(18, 'years').format('YYYY-MM-DD');
      endTime = moment(timeRange[1]).subtract(18, 'years').format('YYYY-MM-DD');
    }

    if (startTime && endTime) {
      // 设置查询参数并重新加载表格
      actionRef.current?.reloadAndRest?.();
    } else {
      message.error('请先选择查询日期！');
    }
  };

  // 新增
  const handleAdd = () => {
    setModalTitle('新增');
    setCurrentRow(undefined);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: StudentParams) => {
    setModalTitle('编辑');
    setCurrentRow(record);
    form.setFieldsValue({
      ...record,
      birth: record.birth ? moment(record.birth, 'YYYY-MM-DD') : null,
    });
    setModalVisible(true);
  };

  // 删除
  const handleDelete = async (record: StudentParams) => {
    Modal.confirm({
      title: '删除',
      content: '删除操作不可逆，确定删除吗?',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (record._id) {
            await delStudent(record._id);
            message.success('删除成功！');
            actionRef.current?.reload();
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        birth: values.birth ? values.birth.format('YYYY-MM-DD') : '',
        _id: currentRow?._id,
      };

      setLoading(true);
      let success = false;

      if (currentRow?._id) {
        const result = await updateStudent(formData as StudentParams);
        if (result) {
          message.success('更新成功！');
          success = true;
        }
      } else {
        const result = await addStudent(formData as StudentParams);
        if (result) {
          message.success('新增成功！');
          success = true;
        }
      }

      if (success) {
        setModalVisible(false);
        actionRef.current?.reload();
      }
    } catch (error) {
      console.error('表单提交错误:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取表格数据
  const fetchStudentList = async (params: any) => {
    setLoading(true);

    // 构建查询参数
    const queryParams: any = {
      pageIndex: params.current || 1,
      pageSize: params.pageSize || 10,
      startTime: '',
      endTime: '',
    };

    // 添加日期查询条件
    if (dateType === 0 && month) {
      queryParams.startTime = moment(month)
        .subtract(18, 'years')
        .startOf('month')
        .format('YYYY-MM-DD');
      queryParams.endTime = moment(month).subtract(18, 'years').endOf('month').format('YYYY-MM-DD');
    } else if (dateType === 1 && date) {
      queryParams.startTime = moment(date).subtract(18, 'years').format('YYYY-MM-DD');
      queryParams.endTime = moment(date).subtract(18, 'years').format('YYYY-MM-DD');
    } else if (dateType === 2 && timeRange.length === 2) {
      queryParams.startTime = moment(timeRange[0]).subtract(18, 'years').format('YYYY-MM-DD');
      queryParams.endTime = moment(timeRange[1]).subtract(18, 'years').format('YYYY-MM-DD');
    }

    try {
      const response = await listStudent(queryParams);
      console.log('response', response);
      if (response && response.status === 0) {
        const formattedData = response.data.map((item: StudentParams) => ({
          ...item,
          birth: item.birth ? moment(item.birth).format('YYYY-MM-DD') : '',
          createTime: item.createTime ? moment(item.createTime).format('YYYY-MM-DD') : '',
        }));

        return {
          data: formattedData,
          total: response.total,
          success: true,
        };
      }
      return { data: [], total: 0, success: true };
    } catch (error) {
      return { data: [], total: 0, success: true };
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ProColumns<StudentParams>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
    },
    {
      title: '性别',
      dataIndex: 'sex',
      render: (_, record) => (record.sex ? '男' : '女'),
    },
    {
      title: '出生日期',
      dataIndex: 'birth',
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
    },
    {
      title: '备注信息',
      dataIndex: 'bro',
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160, // 加宽操作列，避免按钮挤压
      render: (_, record) => (
        // 使用Space包裹按钮，统一控制间距
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger size="small" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 调整查询区域布局：使用flex实现左右分布，替代float */}
      <div style={{ marginBottom: 16, padding: 24, backgroundColor: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* 左侧查询控件 */}
          <Space wrap size="middle">
            <Select
              placeholder="请选择查询方式"
              value={dateType}
              onChange={handleDateTypeChange}
              style={{ width: 120 }}
            >
              <Option value={0}>月查询</Option>
              <Option value={1}>日查询</Option>
              <Option value={2}>自定义</Option>
            </Select>

            {dateType === 0 && (
              <DatePicker
                picker="month"
                format="YYYY-MM"
                placeholder="请选择月份"
                value={month ? moment(month, 'YYYY-MM') : null}
                onChange={handleMonthChange}
              />
            )}

            {dateType === 1 && (
              <DatePicker
                placeholder="请选择日期"
                value={date ? moment(date, 'YYYY-MM-DD') : null}
                onChange={handleDateChange}
              />
            )}

            {dateType === 2 && (
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={
                  timeRange[0] && timeRange[1]
                    ? [moment(timeRange[0]), moment(timeRange[1])]
                    : undefined
                }
                onChange={handleTimeRangeChange as any}
              />
            )}

            <Button type="primary" onClick={handleSearch} loading={loading}>
              查询满18周岁的人
            </Button>

            <Button onClick={handleReset}>重置</Button>
          </Space>

          {/* 右侧新增按钮 */}
          <Button type="primary" onClick={handleAdd}>
            新增
          </Button>
        </div>
      </div>

      <ProTable<StudentParams>
        headerTitle="学员列表"
        actionRef={actionRef}
        rowKey="_id"
        loading={loading}
        columns={columns}
        request={fetchStudentList}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '30', '40', '50'],
        }}
        search={false}
        options={false}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
            确定
          </Button>,
        ]}
        width={420}
        destroyOnClose
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名！' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item label="性别" name="sex" rules={[{ required: true, message: '请选择性别！' }]}>
            <Select placeholder="请选择性别">
              <Option value={true}>男</Option>
              <Option value={false}>女</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="出生日期"
            name="birth"
            rules={[{ required: true, message: '请选择出生日期！' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="请选择出生日期"
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            label="手机号码"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号码！' },
              {
                pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
                message: '手机号码格式错误！',
              },
            ]}
          >
            <Input placeholder="请输入手机号码" />
          </Form.Item>

          <Form.Item
            label="备注信息"
            name="bro"
            rules={[{ required: true, message: '请输入备注信息！' }]}
          >
            <Input placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StudentManagement;
