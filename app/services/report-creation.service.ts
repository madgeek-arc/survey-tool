import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module'
// import ImageModule from 'open-docxtemplater-image-module-2';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})

export class ReportCreationService {

  // templateUrl = 'src/survey-tool/assets/docx-templates/report_template_test.docx';
  templateUrl = 'assets/docx-templates/report_template_test.docx';

  private base64Regex = /^(?:data:)?image\/(png|jpg|jpeg|svg|svg\+xml);base64,/;

  private validBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

  constructor(private http: HttpClient) {}

  async exportDoc() {

    let data: object = {
      "Question22": "33%",
      Question22_1: 12 + ' %',
      // chartImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QIJBywfp3IOswAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAkUlEQVQY052PMQqDQBREZ1f/d1kUm3SxkeAF/FdIjpOcw2vpKcRWCwsRPMFPsaIQSIoMr5pXDGNUFd9j8TOn7kRW71fvO5HTq6qqtnWtzh20IqE3YXtL0zyKwAROQLQ5l/c9gHjfKK6wMZjADE6s49Dver4/smEAc2CuqgwAYI5jU9NcxhHEy60sni986H9+vwG1yDHfK1jitgAAAABJRU5ErkJggg==",
      // "chartImage": "https://www.eoscobservatory.eu/assets/images/EN%20V%20Funded%20by%20the%20EU_POS.png",
      chartImage1: 'assets/images/2-2.png'
    }

    // 2. Fetch the .docx template as ArrayBuffer
    const content = await this.http.get(this.templateUrl, { responseType: 'arraybuffer' }).toPromise();

    // 3. Initialize PizZip + docxtemplater/image-module
    const zip = new PizZip(content);
    console.log(Object.keys(zip.files));


    // const imageOptions = {
    //   getImage(tagValue) {
    //     return this.base64Parser(tagValue);
    //   },
    //   getSize(img, tagValue, tagName, context) {
    //     return [100, 100];
    //   },
    // };
    const imageOptions = {
      fileType: 'docx',
      centered: false,
      getImage: (tagValue: string) => {
        // tagValue holds e.g. 'assets/chart.png'
        return this.http.get(tagValue, { responseType: 'arraybuffer' }).toPromise();
      },
      getSize: (img: ArrayBuffer) => {
        // Example fixed size — adjust to your chart dimensions
        return [400, 300];
      }
    };

    // const doc = new Docxtemplater(zip, {modules: [new ImageModule(imageOptions)]});

    // const doc = new Docxtemplater(zip, {
    //   fileType: 'docx',                // inform core which XML part to target
    //   modules: [new ImageModule(imageOptions)],          // pass the module here
    // });


    // const imageModule = new ImageModule(imageOptions);
    const doc = new Docxtemplater();
    doc.attachModule(new ImageModule(imageOptions));
    doc.loadZip(zip);
    doc.setOptions({fileType: 'docx'});
    doc.setData(data);
    // console.log(Object.keys((doc as any)));
    console.log('fileTypeConfig:', (doc as any).fileTypeConfig);
    console.log(doc);
    // console.log('moduleMeta:', (doc as any).moduleMeta);

    // 4. Set your dynamic data
    // doc.setData(data);

    // 5. Render & generate a Blob
    try {
      doc.render();
    } catch (err) {
      console.error('Template error:', err);
      return;
    }

    const out = doc.getZip().generate(
      { type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    );

    // 6. Trigger download
    saveAs(out, 'report.docx');
  }
  //
  // base64Parser(tagValue) {
  //   if (typeof tagValue !== "string" || !this.base64Regex.test(tagValue)) {
  //     return false;
  //   }
  //
  //   const stringBase64 = tagValue.replace(this.base64Regex, "");
  //
  //   if (!this.validBase64.test(stringBase64)) {
  //     throw new Error(
  //       "Error parsing base64 data, your data contains invalid characters"
  //     );
  //   }
  //
  //   // For nodejs, return a Buffer
  //   if (typeof Buffer !== "undefined" && Buffer.from) {
  //     return Buffer.from(stringBase64, "base64");
  //   }
  //
  //   // For browsers, return a string (of binary content) :
  //   const binaryString = window.atob(stringBase64);
  //   const len = binaryString.length;
  //   const bytes = new Uint8Array(len);
  //   for (let i = 0; i < len; i++) {
  //     const ascii = binaryString.charCodeAt(i);
  //     bytes[i] = ascii;
  //   }
  //
  //
  //   return bytes.buffer;
  // }

}
