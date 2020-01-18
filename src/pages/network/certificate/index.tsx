import React, { Fragment, useEffect, useState } from "react"
import { ColumnProps, PaginationConfig, SorterResult } from "antd/es/table";
import { Divider, Card, Table, Modal, message, Button, Popconfirm } from "antd";
import { PageHeaderWrapper } from "@ant-design/pro-layout";
import styles from '@/utils/table.less';
import Search from "./search";
import { CertificateItem } from "./data";
import ConnectState, { Dispatch, Loading } from "@/models/connect";
import { connect } from "dva";
import encodeQueryParam from "@/utils/encodeParam";
import Save from "./save";
interface Props {
    certificate: any;
    dispatch: Dispatch;
    location: Location;
    loading: boolean;
}

interface State {
    data: any;
    searchParam: any;
    saveVisible: boolean;
    current: Partial<CertificateItem>;
}

const CertificateList: React.FC<Props> = (props) => {

    const { dispatch } = props;

    const result = props.certificate.result;

    const initState: State = {
        data: result,
        searchParam: { pageSize: 10 },
        saveVisible: false,
        current: {},
    }

    const [searchParam, setSearchParam] = useState(initState.searchParam);
    const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
    const [current, setCurrent] = useState(initState.current);

    const columns: ColumnProps<CertificateItem>[] = [
        {
            title: '名称',
            dataIndex: 'name',
        },

        {
            title: '类型',
            dataIndex: 'instance',
        },
        {
            title: '描述',
            dataIndex: 'description',
        },
        {
            title: '操作',
            render: (text, record) => (
                <Fragment>
                    <a onClick={() => edit(record)}>编辑</a>
                    <Divider type="vertical" />
                    <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}>
                        <a >删除</a>
                    </Popconfirm>
                </Fragment>
            ),
        },
    ];

    useEffect(() => {
        handleSearch(searchParam);
    }, []);

    const handleSearch = (params?: any) => {
        dispatch({
            type: 'certificate/query',
            payload: encodeQueryParam(params)
        });
    }

    const edit = (record: CertificateItem) => {
        setCurrent(record);
        setSaveVisible(true);
    }
    const setting = (record: CertificateItem) => {

    }

    const saveOrUpdate = (item: CertificateItem) => {
        dispatch({
            type: 'certificate/insert',
            payload: encodeQueryParam(item),
            callback: (response) => {
                setSaveVisible(false);
                handleSearch(searchParam);
            }
        })
    }
    const handleDelete = (params: any) => {
        dispatch({
            type: 'certificate/remove',
            payload: params.id,
            callback: (response) => {
                message.success("删除成功");
                handleSearch();
            }
        });
    }


    const onTableChange = (pagination: PaginationConfig, filters: any, sorter: SorterResult<MqttItem>, extra: any) => {
        handleSearch({
            pageIndex: Number(pagination.current) - 1,
            pageSize: pagination.pageSize,
            terms: searchParam,
            sorts: sorter,
        });
    }

    return (
        <PageHeaderWrapper
            title="证书管理"
        >
            <Card bordered={false}>
                <div className={styles.tableList}>
                    {/* <div className={styles.tableListForm}> */}
                    <Search search={(params: any) => {
                        setSearchParam(params);
                        handleSearch({ terms: params, pageSize: 10 })
                    }} />
                    {/* </div> */}
                    <div className={styles.tableListOperator}>
                        <Button
                            icon="plus"
                            type="primary"
                            onClick={() => { setCurrent({}); setSaveVisible(true) }}>
                            新建
                        </Button>
                    </div>
                    <div className={styles.StandardTable}>
                        <Table
                            loading={props.loading}
                            dataSource={(result || {}).data}
                            columns={columns}
                            rowKey={'id'}
                            onChange={onTableChange}
                            pagination={{
                                current: result.pageIndex + 1,
                                total: result.total,
                                pageSize: result.pageSize,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                showTotal: (total: number) => {
                                    return `共 ${total} 条记录 第  ` + (result.pageIndex + 1) + '/' + Math.ceil(result.total / result.pageSize) + '页';
                                }
                            }}
                        />
                    </div>
                </div>
            </Card>
            {
                saveVisible &&
                <Save
                    data={current}
                    close={() => { setSaveVisible(false) }}
                    save={(data: CertificateItem) => { saveOrUpdate(data) }}
                />
            }
        </PageHeaderWrapper>
    )
}
export default connect(({ certificate, loading }: ConnectState) => ({
    certificate, loading: loading.models.certificate
}))(CertificateList)