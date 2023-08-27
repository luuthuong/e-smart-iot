import React, {useState} from "react";
import {Document, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text, View} from '@react-pdf/renderer';
import {IonButton, IonChip, IonIcon, IonText, IonToggle} from "@ionic/react";
import {closeOutline, saveOutline} from "ionicons/icons";
import {Range} from 'react-date-range'
import {DateRangeModal} from "../../components";
import moment from "moment";
import {getHistoryDeviceByFilter, getHistorySensorByFilter} from "../../services";
import {DeviceFilterResponse, SensorFilterResponse} from "../../shared";


const styles = StyleSheet.create({
  headingTop:{
    textAlign: 'center',
    marginBottom: '4px'
  },
  table: {
    display: "flex",
    width: "auto",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row"
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10
  }
});


const ReportContent = ({sensors = [], devices = [], time}: {
  sensors?: SensorFilterResponse[],
  devices?: DeviceFilterResponse[],
  time?: string
}) =>{
  return <Document>
    <Page size="A4" >
      <View>
        <Text style={styles.headingTop}>REPORTER</Text>
        <Text style={{fontSize: '12px'}}>
          {time}
        </Text>
      </View>

      <View style={{marginBottom: '12px'}}>
        <Text>Sensor</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Time</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Light</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Soil</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Temperature</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Rain</Text>
          </View>
        </View>
        {
          sensors.map((item,index) =>(
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{moment(item.time).format("DD/MM/yyyy")}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.light}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.soil}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.temperature}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{
                      item.soil
                    }</Text>
                  </View>
                </View>
          ))
        }

        <View style={{margin: '12px 0'}}>
          <Text>Device</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Time</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Light</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Pump</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Motor</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Fan</Text>
            </View>
          </View>
          {
            devices.map((item,index) =>(
                <View key={index} style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{moment(item.time).format("DD/MM/yyyy")}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.light ? 'ON' : 'OPF'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.pump  ? 'ON' : 'OPF'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{item.motor  ? 'ON' : 'OPF'}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{
                      item.fan  ? 'ON' : 'OPF'
                    }</Text>
                  </View>
                </View>
            ))
          }
        </View>
      </View>
    </Page>
  </Document>
}

export const Report = () => {

  const [preview, setPreview] = useState(true);
  const [range, setRange] = useState<Range[]>([]);

  const [sensor, setSensor] = useState<SensorFilterResponse[]>([]);
  const [device, setDevice] = useState<DeviceFilterResponse[]>([]);

  const onCloseDate = (range: Range[]) =>{
    console.log(range);
  }

  const onConfirmDate = (range: Range[]) =>{
    getHistorySensorByFilter({
      from: range[0].startDate!,
      to: range[0].endDate
    }).then(result =>{
      setSensor(result);
    });

    getHistoryDeviceByFilter({
      from: range[0].startDate!,
      to: range[0].endDate
    }).then(res =>setDevice(res));
    setRange(range)
  }

  return <>
    <div className={'grid grid-cols-4 '}>
      <div className={'col-span-3 flex items-center justify-center gap-x-2'}>
        {
         range.length ? <>
            <IonText>Range:</IonText>
            <div>
              <IonChip>{moment(range[0].startDate).format("DD/MM/yyyy")}</IonChip>
              -
              <IonChip>{moment(range[0].endDate).format("DD/MM/yyyy")}</IonChip>
            </div>
              <IonButton onClick={() => setRange([])} size={'small'} color={'light'}>
                <IonIcon className={'flex justify-center'} icon={closeOutline}></IonIcon>
              </IonButton>
          </>: <></>
        }
      </div>
    <div className={'flex  items-center gap-x-1 justify-end my-2'}>
      <DateRangeModal confirm={onConfirmDate} close={onCloseDate}/>
      {/*<IonToggle checked={preview} onIonChange={(val) => setPreview(val.detail.checked)}>Preview</IonToggle>*/}
      <PDFDownloadLink
          document={<ReportContent/>}
          fileName={'report.pdf'}
      >
        <IonButton color={'warning'} className={'flex items-center '}>
          <span>Save PDF</span> <IonIcon className={'ml-1'} color={'dark'} icon={saveOutline}></IonIcon>
        </IonButton>
      </PDFDownloadLink>
    </div>

    </div>
    {
      <PDFViewer width={'100%'} height={'100%'}>
        <ReportContent
            sensors={sensor}
            devices={device}
            time={`${moment(range[0]?.startDate).format("DD/MM/yyyy")} - ${moment(range[0]?.endDate).format("DD/MM/yyyy")}`}
        />
      </PDFViewer>
    }
  </>
}