import React, { useState, useRef } from 'react';
import moment from 'moment';
import type { Moment } from 'moment';
import { Button, message, DatePicker, Select, Space, Modal, Form, Input } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useIntl } from 'umi'; // 国际化钩子
import type { StudentParams } from './data.d';
import { listStudent, addStudent, updateStudent, delStudent } from './service';

const { RangePicker } = DatePicker;
const { Option } = Select;

const StudentManagement: React.FC = () => {
  const intl = useIntl(); // 初始化intl
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
      message.error(
        intl.formatMessage({ id: 'pages.studentManagement.message.searchDateRequired' }),
      );
    }
  };

  // 新增
  const handleAdd = () => {
    setModalTitle(intl.formatMessage({ id: 'pages.studentManagement.modal.title.add' }));
    setCurrentRow(undefined);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: StudentParams) => {
    setModalTitle(intl.formatMessage({ id: 'pages.studentManagement.modal.title.edit' }));
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
      title: intl.formatMessage({ id: 'pages.studentManagement.deleteConfirm.title' }),
      content: intl.formatMessage({ id: 'pages.studentManagement.deleteConfirm.content' }),
      okText: intl.formatMessage({ id: 'pages.studentManagement.deleteConfirm.okText' }),
      cancelText: intl.formatMessage({ id: 'pages.studentManagement.deleteConfirm.cancelText' }),
      onOk: async () => {
        try {
          if (record._id) {
            await delStudent(record._id);
            message.success(
              intl.formatMessage({ id: 'pages.studentManagement.message.deleteSuccess' }),
            );
            actionRef.current?.reload();
          }
        } catch (error) {
          message.error(intl.formatMessage({ id: 'pages.studentManagement.message.deleteFail' }));
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
          message.success(
            intl.formatMessage({ id: 'pages.studentManagement.message.updateSuccess' }),
          );
          success = true;
        }
      } else {
        const result = await addStudent(formData as StudentParams);
        if (result) {
          message.success(intl.formatMessage({ id: 'pages.studentManagement.message.addSuccess' }));
          success = true;
        }
      }

      if (success) {
        setModalVisible(false);
        actionRef.current?.reload();
      }
    } catch (error) {
      console.error(
        intl.formatMessage({ id: 'pages.studentManagement.message.submitError' }),
        error,
      );
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
      title: intl.formatMessage({ id: 'pages.studentManagement.table.index' }),
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'pages.studentManagement.table.name' }),
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'pages.studentManagement.table.sex' }),
      dataIndex: 'sex',
      render: (_, record) =>
        record.sex
          ? intl.formatMessage({ id: 'pages.studentManagement.table.sexMale' })
          : intl.formatMessage({ id: 'pages.studentManagement.table.sexFemale' }),
    },
    {
      title: intl.formatMessage({ id: 'pages.studentManagement.table.birth' }),
      dataIndex: 'birth',
    },
    {
      title: intl.formatMessage({ id: 'pages.studentManagement.table.phone' }),
      dataIndex: 'phone',
    },
    {
      title: intl.formatMessage({ id: 'pages.studentManagement.table.remark' }),
      dataIndex: 'bro',
    },
    {
      title: intl.formatMessage({ id: 'pages.studentManagement.table.createTime' }),
      dataIndex: 'createTime',
    },
    {
      title: intl.formatMessage({ id: 'pages.studentManagement.table.operation' }),
      valueType: 'option',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            {intl.formatMessage({ id: 'pages.studentManagement.table.edit' })}
          </Button>
          <Button type="link" danger size="small" onClick={() => handleDelete(record)}>
            {intl.formatMessage({ id: 'pages.studentManagement.table.delete' })}
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
              placeholder={intl.formatMessage({ id: 'pages.studentManagement.query.placeholder' })}
              value={dateType}
              onChange={handleDateTypeChange}
              style={{ width: 130 }}
            >
              <Option value={0}>
                {intl.formatMessage({ id: 'pages.studentManagement.query.monthQuery' })}
              </Option>
              <Option value={1}>
                {intl.formatMessage({ id: 'pages.studentManagement.query.dayQuery' })}
              </Option>
              <Option value={2}>
                {intl.formatMessage({ id: 'pages.studentManagement.query.customQuery' })}
              </Option>
            </Select>

            {dateType === 0 && (
              <DatePicker
                picker="month"
                format="YYYY-MM"
                placeholder={intl.formatMessage({
                  id: 'pages.studentManagement.query.monthPlaceholder',
                })}
                value={month ? moment(month, 'YYYY-MM') : null}
                onChange={handleMonthChange}
              />
            )}

            {dateType === 1 && (
              <DatePicker
                placeholder={intl.formatMessage({
                  id: 'pages.studentManagement.query.datePlaceholder',
                })}
                value={date ? moment(date, 'YYYY-MM-DD') : null}
                onChange={handleDateChange}
              />
            )}

            {dateType === 2 && (
              <RangePicker
                placeholder={[
                  intl.formatMessage({ id: 'pages.studentManagement.query.rangeStartPlaceholder' }),
                  intl.formatMessage({ id: 'pages.studentManagement.query.rangeEndPlaceholder' }),
                ]}
                value={
                  timeRange[0] && timeRange[1]
                    ? [moment(timeRange[0]), moment(timeRange[1])]
                    : undefined
                }
                onChange={handleTimeRangeChange as any}
              />
            )}

            <Button type="primary" onClick={handleSearch} loading={loading}>
              {intl.formatMessage({ id: 'pages.studentManagement.query.searchButton' })}
            </Button>

            <Button onClick={handleReset}>
              {intl.formatMessage({ id: 'pages.studentManagement.query.resetButton' })}
            </Button>
          </Space>

          {/* 右侧新增按钮 */}
          <Button type="primary" onClick={handleAdd}>
            {intl.formatMessage({ id: 'pages.studentManagement.query.addButton' })}
          </Button>
        </div>
      </div>

      <ProTable<StudentParams>
        headerTitle={intl.formatMessage({ id: 'pages.studentManagement.table.headerTitle' })}
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
            {intl.formatMessage({ id: 'pages.studentManagement.modal.cancel' })}
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
            {intl.formatMessage({ id: 'pages.studentManagement.modal.ok' })}
          </Button>,
        ]}
        width={420}
        destroyOnClose
      >
        <Form form={form} layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
          <Form.Item
            label={intl.formatMessage({ id: 'pages.studentManagement.form.label.name' })}
            name="name"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.studentManagement.form.validation.nameRequired',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.studentManagement.form.placeholder.name',
              })}
            />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'pages.studentManagement.form.label.sex' })}
            name="sex"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.studentManagement.form.validation.sexRequired',
                }),
              },
            ]}
          >
            <Select
              placeholder={intl.formatMessage({
                id: 'pages.studentManagement.form.placeholder.sex',
              })}
            >
              <Option value={true}>
                {intl.formatMessage({ id: 'pages.studentManagement.table.sexMale' })}
              </Option>
              <Option value={false}>
                {intl.formatMessage({ id: 'pages.studentManagement.table.sexFemale' })}
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'pages.studentManagement.form.label.birth' })}
            name="birth"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.studentManagement.form.validation.birthRequired',
                }),
              },
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({
                id: 'pages.studentManagement.form.placeholder.birth',
              })}
              format="YYYY-MM-DD"
            />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'pages.studentManagement.form.label.phone' })}
            name="phone"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.studentManagement.form.validation.phoneRequired',
                }),
              },
              {
                pattern: /^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,
                message: intl.formatMessage({
                  id: 'pages.studentManagement.form.validation.phonePattern',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.studentManagement.form.placeholder.phone',
              })}
            />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: 'pages.studentManagement.form.label.remark' })}
            name="bro"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: 'pages.studentManagement.form.validation.remarkRequired',
                }),
              },
            ]}
          >
            <Input
              placeholder={intl.formatMessage({
                id: 'pages.studentManagement.form.placeholder.remark',
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default StudentManagement;
