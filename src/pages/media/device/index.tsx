import {PageHeaderWrapper} from "@ant-design/pro-layout"
import {Badge, Card, Divider, Popconfirm} from "antd";
import React, {Fragment, useEffect, useState} from "react";
import styles from '@/utils/table.less';
import SearchForm from "@/components/SearchForm";
import ProTable from "@/pages/system/permission/component/ProTable";
import {ColumnProps} from "antd/lib/table";
import Service from "./service";
import encodeQueryParam from "@/utils/encodeParam";
import moment from "moment";

interface Props {

}

interface State {
  searchParam: any;
}

const initState: State = {
  searchParam: {pageSize: 10, terms: location?.query?.terms, sorts: {field: 'id', order: 'desc'}},
};
const MediaDevice: React.FC<Props> = () => {
  const service = new Service('device/instance');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>({});

  const [productList, setProductList] = useState<any[]>([]);
  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const statusMap = new Map();
  statusMap.set('online', 'success');
  statusMap.set('offline', 'error');
  statusMap.set('notActive', 'processing');

  useEffect(() => {
    service.mediaGateway({}).subscribe((data) => {
      let productIdList: any[] = [];
      data.map((item: any) => {
        productIdList.push(item.productId)
      });
      setProductList(productIdList);
      searchParam.terms = {productId$IN: productIdList};
      handleSearch(encodeQueryParam(searchParam));
    })
  }, []);

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    setLoading(true);
    service.query(encodeQueryParam(params)).subscribe(
      (data) => setResult(data),
      () => {
      },
      () => setLoading(false))
  };


  const columns: ColumnProps<any>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
    },
    {
      title: '注册时间',
      dataIndex: 'registryTime',
      width: '200px',
      render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: '90px',
      render: record => record ? <Badge status={statusMap.get(record.value)} text={record.text}/> : '',
      filters: [
        {
          text: '未启用',
          value: 'notActive',
        },
        {
          text: '离线',
          value: 'offline',
        },
        {
          text: '在线',
          value: 'online',
        },
      ],
      filterMultiple: false,
    },
    {
      title: '描述',
      dataIndex: 'describe',
      width: '15%',
      ellipsis: true
    },
    {
      title: '操作',
      width: '250px',
      align: 'center',
      render: (record: any) => (
        <Fragment>
          <a
            onClick={() => {
            }}
          >
            编辑
          </a>
          <Divider type="vertical"/>
          <a
            onClick={() => {
              // router.push(`/device/instance/save/${record.id}`);
            }}
          >
            查看通道
          </a>
          <Divider type="vertical"/>
          <Popconfirm
            title="确认更新吗？"
            onConfirm={() => {

            }}>
            <a>更新通道</a>
          </Popconfirm>
        </Fragment>
      )
    },
  ];
  return (
    <PageHeaderWrapper title="国标设备">
      <Card bordered={false} style={{marginBottom: 16}}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              search={(params: any) => {
                setSearchParam(params);
                params.productId$IN = productList;
                handleSearch({terms: {...params}, pageSize: 10, sorts: {field: 'id', order: 'desc'}});
              }}
              formItems={[
                {
                  label: '名称',
                  key: 'name$LIKE',
                  type: 'string',
                },
              ]}
            />
          </div>

        </div>
      </Card>
      <Card>
        <div className={styles.StandardTable}>
          <ProTable
            loading={loading}
            dataSource={result?.data}
            columns={columns}
            rowKey="id"
            onSearch={(params: any) => {
              params.terms = {productId$IN: productList};
              params.sorts = {field: 'id', order: 'desc'};
              handleSearch(params);
            }}
            paginationConfig={result}
          />
        </div>
      </Card>
    </PageHeaderWrapper>
  )
};
export default MediaDevice;