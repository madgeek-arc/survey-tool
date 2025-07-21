import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})

export class ReportCreationService {

  // templateUrl = 'src/survey-tool/assets/docx-templates/report_template_test.docx';
  templateUrl = 'assets/docx-templates/report_template_test.docx';

  constructor(private http: HttpClient) {}

  async exportDoc() {
    // 1. Export chart to base64 PNG
    // const imgData = this.chart.createCanvas().toDataURL('image/png');
    const imgData = 'test.png'

    // 2. Fetch the .docx template as ArrayBuffer
    const content = await this.http.get(this.templateUrl, { responseType: 'arraybuffer' }).toPromise();

    // 3. Initialize PizZip + docxtemplater/image-module
    const zip = new PizZip(content);
    const imageOpts = {
      centered: false,
      getImage: (tagValue: string) => Buffer.from(tagValue.split(',')[1], 'base64'),
      getSize: () => [350, 200],  // px → Word will scale
    };
    const doc = new Docxtemplater(zip, { modules: [ new ImageModule(imageOpts) ] });

    // 4. Set your dynamic data
    let tmpData = 12;
    doc.setData({
      "Question22": '33%',
      "Question22.1": tmpData + ' %',

      // Pass the full data URI for the image tag in your template
      // chartImage: imgData
    });

    // 5. Render & generate a Blob
    try {
      doc.render();
    } catch (err) {
      console.error('Template error:', err);
      return;
    }
    const out = doc.getZip().generate({ type: 'blob', mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    // 6. Trigger download
    saveAs(out, 'report.docx');
  }
}
