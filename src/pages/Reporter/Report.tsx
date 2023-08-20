import React, {useState} from "react";
import {Document, Page, PDFDownloadLink, PDFViewer, StyleSheet, Text, View} from '@react-pdf/renderer';
import {IonButton, IonChip, IonIcon, IonText, IonToggle} from "@ionic/react";
import {closeOutline, saveOutline} from "ionicons/icons";
import {Range} from 'react-date-range'
import {DateRangeModal} from "../../components";
import moment from "moment";


const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

const ReportContent = () =>{
  return <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Section #1</Text>
      </View>
      <View style={styles.section}>
        <Text>Section #2</Text>
      </View>
    </Page>
  </Document>
}

export const Report = () => {

  const [preview, setPreview] = useState(false);
  const [range, setRange] = useState<Range[]>([])

  const onCloseDate = (range: Range[]) =>{
    console.log(range);
  }

  const onConfirmDate = (range: Range[]) =>{
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
              <IonChip>{moment(range[0].startDate).format("DD/MM/yyyy")}</IonChip>
            </div>
              <IonButton onClick={() => setRange([])} size={'small'} color={'light'}>
                <IonIcon className={'flex justify-center'} icon={closeOutline}></IonIcon>
              </IonButton>
          </>: <></>
        }
      </div>
    <div className={'flex  items-center gap-x-1 justify-end my-2'}>
      <DateRangeModal confirm={onConfirmDate} close={onCloseDate}/>
      <IonToggle checked={preview} onIonChange={(val) => setPreview(val.detail.checked)}>Preview</IonToggle>
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
      preview && <PDFViewer width={'100%'} height={'100%'}>
        <ReportContent />
      </PDFViewer>
    }
  </>
}