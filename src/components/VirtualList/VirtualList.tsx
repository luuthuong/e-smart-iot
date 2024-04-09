import * as React from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList, ListChildComponentProps } from "react-window";

function renderRow<T = any>(
    props: ListChildComponentProps,
    itemFn: (item: T) => React.ReactNode
) {
    const { index, style, data } = props;

    return (
        <ListItem style={style} key={index} component="div" disablePadding>
            <ListItem>
                <ListItemText primary={itemFn(data[index])} />
            </ListItem>
        </ListItem>
    );
}

export default function VirtualizedList<T>({
    data,
    renderFn,
}: {
    data: T[];
    renderFn: (item: T) => React.ReactNode;
}) {
    return (
        <Box
            sx={{
                width: "100%",
                height: 300,
                maxWidth: '100%',
                bgcolor: "background.paper",
            }}
        >
            <FixedSizeList
                height={300}
                width={'100%'}
                itemSize={40}
                itemData={data}
                itemCount={data.length}
                overscanCount={5}
            >
                {(props) => renderRow(props, renderFn)}
            </FixedSizeList>
        </Box>
    );
}
