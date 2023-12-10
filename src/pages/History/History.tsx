import React, {useEffect, useState} from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import {styled, StyledEngineProvider} from '@mui/material/styles';
import TableCell, {tableCellClasses} from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import {alpha, Box, FormControl, FormControlLabel, Radio, RadioGroup, TableSortLabel} from "@mui/material";
import {DeviceFilterResponse, SensorFilterResponse} from "../../shared";
import {getHistoryDeviceByFilter, getHistorySensorByFilter} from "../../services";
import moment from "moment/moment";


const StyledTableCell = styled(TableCell)(({theme}) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.grey["500"],
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({theme}) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<T>(order: Order, orderBy: keyof T): (a: T, b: T) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) {
            return order;
        }
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}


interface HeadCell<T> {
    disablePadding: boolean;
    id: keyof T;
    label: string;
    numeric: boolean;
}

const headCellSensor: HeadCell<SensorFilterResponse>[] = [
    {
        id: 'time',
        numeric: false,
        disablePadding: true,
        label: 'Time',
    },
    {
        id: 'soil',
        numeric: true,
        disablePadding: false,
        label: 'Soil',
    },
    {
        id: 'temperature',
        numeric: true,
        disablePadding: false,
        label: 'Temperature',
    },
    {
        id: 'light',
        numeric: true,
        disablePadding: false,
        label: 'Light',
    },
    {
        id: 'rain',
        numeric: true,
        disablePadding: false,
        label: 'Rain',
    },
];

const headCellDevice: HeadCell<DeviceFilterResponse>[] = [
    {
        id: 'time',
        numeric: false,
        disablePadding: true,
        label: 'Time',
    },
    {
        id: 'fan',
        numeric: true,
        disablePadding: false,
        label: 'Fan',
    },
    {
        id: 'pump',
        numeric: true,
        disablePadding: false,
        label: 'Pump',
    },
    {
        id: 'motor',
        numeric: true,
        disablePadding: false,
        label: 'Motor',
    },
    {
        id: 'light',
        numeric: true,
        disablePadding: false,
        label: 'Light',
    },
];


interface EnhancedTableProps<T> {
    numSelected: number;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: keyof (SensorFilterResponse & DeviceFilterResponse);
    rowCount: number;
    data: HeadCell<T>[];
}

function EnhancedTableHead<T extends { id: string }>(props: EnhancedTableProps<T>) {
    const {onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, data} =
        props;
    const createSortHandler =
        (property: keyof T) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {data.length &&
                    data.map((headCell, index) => (
                        <StyledTableCell
                            key={index}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                            </TableSortLabel>
                        </StyledTableCell>
                    ))}
            </TableRow>
        </TableHead>
    );
}


enum ViewType {
    Device,
    Sensor
}

interface EnhancedTableToolbarProps {
    numSelected: number;
    typeViewValue: ViewType,
    handleChangeTypeViewChange: React.Dispatch<React.SetStateAction<ViewType>>
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const {numSelected} = props;

    return (
        <Toolbar
            sx={{
                pl: {sm: 2},
                pr: {xs: 1, sm: 1},
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
            className={'flex justify-between'}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{flex: '1 1 100%'}}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    History
                </Typography>
            )}

            <FormControl>
                <RadioGroup className={'flex flex-wrap flex-row'} name="controlled-radio-buttons-group"
                            value={props.typeViewValue}
                            onChange={(val) => props.handleChangeTypeViewChange(val.target.value as unknown as ViewType)}>
                    <FormControlLabel value={ViewType.Device} control={<Radio/>} label="Device"/>
                    <FormControlLabel value={ViewType.Sensor} control={<Radio/>} label="Sensor"/>
                </RadioGroup>
            </FormControl>
        </Toolbar>
    );
}


const History = () => {

    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof (SensorFilterResponse & DeviceFilterResponse)>('time');
    const [page, setPage] = useState(0);
    const [dense, setDense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [typeView, setTypeView] = useState<ViewType>(ViewType.Sensor);
    const [headerSensor, setHeaderSensor] = useState<HeadCell<SensorFilterResponse>[]>([]);
    const [sensor, setSensor] = useState<SensorFilterResponse[]>([]);

    const [headerDevice, setHeaderDevice] = useState<HeadCell<DeviceFilterResponse>[]>([]);
    const [device, setDevice] = useState<DeviceFilterResponse[]>([]);

    const [deviceSelected, setDeviceSelected] = useState<readonly string[]>([]);
    const [sensorSelected, setSensorSelected] = useState<readonly string[]>([]);


    useEffect(() => {
        if (typeView == ViewType.Sensor) {
            setHeaderSensor(headCellSensor);
            getHistorySensorByFilter({
                from: new Date('2023/07/25'),
            }).then(result => {
                setSensor(result)
            })
        }
        if (typeView == ViewType.Device) {
            setHeaderDevice(headCellDevice);

            getHistoryDeviceByFilter({
                from: new Date('2023/07/25'),
            }).then(result => {
                setDevice(result);
            })
        }
    }, [typeView])

    const handleRequestSort = <T, >(
        event: React.MouseEvent<unknown>,
        property: keyof T,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>, type: ViewType) => {
        switch (type) {
            case ViewType.Sensor: {
                if (event.target.checked) {
                    const newSelected = sensor.map((n) => n.id);
                    setSensorSelected(newSelected);
                    return;
                }
                setSensorSelected([]);
                break;
            }
            case ViewType.Device: {
                if (event.target.checked) {
                    const newSelected = device.map((n) => n.id);
                    setDeviceSelected(newSelected);
                    return;
                }
                setDeviceSelected([]);
                break;
            }
        }


    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDense(event.target.checked);
    };

    const isSelected = (id: string, type: ViewType) => {
        switch (type) {
            case ViewType.Sensor:
                return sensorSelected.indexOf(id) !== -1;
            case ViewType.Device:
                return deviceSelected.indexOf(id) !== -1;
            default:
                return false;
        }
    }

    const emptyRows = (type: ViewType) => page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (type === ViewType.Sensor ? sensor.length : device.length)) : 0;

    const visibleRowsSensor = React.useMemo(
        () =>
            stableSort<SensorFilterResponse>(sensor, getComparator(order, orderBy as keyof SensorFilterResponse)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            ),
        [typeView, sensor, order, orderBy, page, rowsPerPage],
    );

    const visibleRowsDevice = React.useMemo(
        () =>
            stableSort<DeviceFilterResponse>(device, getComparator(order, orderBy as keyof DeviceFilterResponse)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            ),
        [typeView, device, order, orderBy, page, rowsPerPage],
    );


    return (
        <StyledEngineProvider injectFirst>
            <Box sx={{width: '90%'}} className={'mx-auto mt-4'}>
                <Paper sx={{width: '100%', mb: 2}}>
                    <EnhancedTableToolbar typeViewValue={typeView} handleChangeTypeViewChange={setTypeView}
                                          numSelected={typeView === ViewType.Sensor ? sensorSelected.length : deviceSelected.length}/>
                    {
                        typeView == ViewType.Sensor ? (
                                <>
                                    <TableContainer sx={{maxHeight: '60vh'}} component={Paper}>
                                        <Table stickyHeader sx={{minWidth: 700}} aria-label="customized table">
                                            {
                                                <EnhancedTableHead
                                                    numSelected={sensorSelected.length}
                                                    order={order}
                                                    orderBy={orderBy}
                                                    onSelectAllClick={evt => handleSelectAllClick(evt, typeView)}
                                                    onRequestSort={(evt, property) => handleRequestSort<SensorFilterResponse>(evt, property)}
                                                    rowCount={sensor.length}
                                                    data={headerSensor}
                                                />}
                                            <TableBody>
                                                {visibleRowsSensor.map((row, index) => {
                                                    const isItemSelected = isSelected(row.id, typeView);
                                                    const labelId = `enhanced-table-checkbox-${index}`;
                                                    return (
                                                        <TableRow
                                                            hover
                                                            role="checkbox"
                                                            aria-checked={isItemSelected}
                                                            tabIndex={-1}
                                                            key={row.id}
                                                            selected={isItemSelected}
                                                            sx={{cursor: 'pointer'}}
                                                        >
                                                            <TableCell
                                                                component="th"
                                                                id={labelId}
                                                                scope="row"
                                                                padding="none"
                                                            >
                                                                {moment(row.time).format("DD-MM-yyyy HH:mm:ss")}
                                                            </TableCell>
                                                            <TableCell align="right">{row.light}</TableCell>
                                                            <TableCell align="right">{row.soil}</TableCell>
                                                            <TableCell align="right">{row.temperature}</TableCell>
                                                            <TableCell
                                                                align="right">{row.rain ? 'Rain' : 'Not Rain'}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                {emptyRows(typeView) > 0 && (
                                                    <TableRow
                                                        style={{
                                                            height: (dense ? 33 : 53) * emptyRows(typeView),
                                                        }}
                                                    >
                                                        <TableCell colSpan={6}/>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        labelRowsPerPage={'rows/page'}
                                        rowsPerPageOptions={[10, 25, 100]}
                                        component="div"
                                        count={sensor.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </>
                            )
                            : (
                                <>
                                    <TableContainer sx={{maxHeight: '60vh'}} component={Paper}>
                                        <Table stickyHeader sx={{minWidth: 700}} aria-label="customized table">
                                            <EnhancedTableHead
                                                numSelected={deviceSelected.length}
                                                order={order}
                                                orderBy={orderBy}
                                                onSelectAllClick={evt => handleSelectAllClick(evt, typeView)}
                                                onRequestSort={handleRequestSort}
                                                rowCount={device.length}
                                                data={headCellDevice}
                                            />
                                            <TableBody>
                                                {visibleRowsDevice.map((row, index) => {
                                                    const isItemSelected = isSelected(row.id, typeView);
                                                    const labelId = `enhanced-table-checkbox-${index}`;
                                                    return (
                                                        <TableRow
                                                            hover
                                                            role="checkbox"
                                                            aria-checked={isItemSelected}
                                                            tabIndex={-1}
                                                            key={row.id}
                                                            selected={isItemSelected}
                                                            sx={{cursor: 'pointer'}}
                                                        >
                                                            <TableCell
                                                                component="th"
                                                                id={labelId}
                                                                scope="row"
                                                                padding="none"
                                                            >
                                                                {moment(row.time).format("DD-MM-yyyy HH:mm:ss")}
                                                            </TableCell>
                                                            <TableCell align="right">{row.fan ? 'ON' : 'OFF'}</TableCell>
                                                            <TableCell align="right">{row.light ? 'ON' : 'OFF'}</TableCell>
                                                            <TableCell align="right">{row.pump ? 'ON' : 'OFF'}</TableCell>
                                                            <TableCell align="right">{row.motor ? 'ON' : 'OFF'}</TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                {emptyRows(typeView) > 0 && (
                                                    <TableRow
                                                        style={{
                                                            height: (dense ? 33 : 53) * emptyRows(typeView),
                                                        }}
                                                    >
                                                        <TableCell colSpan={6}/>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        labelRowsPerPage={'rows/page'}
                                        rowsPerPageOptions={[10, 25, 100]}
                                        component="div"
                                        count={device.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </>
                            )
                    }
                </Paper>
            </Box>
        </StyledEngineProvider>
    )
}

export default History;
