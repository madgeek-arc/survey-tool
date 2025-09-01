import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module'
import { saveAs } from 'file-saver';

interface ChartImageData {
  buffer: ArrayBuffer;
  width: number;
  height: number;
  title?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportCreationService {

  templateUrl = 'assets/docx-templates/report_template_test.docx';

  constructor(private http: HttpClient) {}

  // Enhanced method to handle both chart images and static images
  async exportDocWithMultipleImages(
    reportData: any,
    chartImages: { [key: string]: ChartImageData },
    staticImages?: { [key: string]: { path: string, width: number, height: number } }
  ) {
    try {
      console.log(`Processing ${Object.keys(chartImages).length} chart images and ${Object.keys(staticImages || {}).length} static images...`);

      // Prepare image data and sizes
      const allImageBuffers: { [key: string]: ArrayBuffer } = {};
      const allImageSizes: { [key: string]: [number, number] } = {};

      // Add chart images
      for (const [key, imageData] of Object.entries(chartImages)) {
        allImageBuffers[key] = imageData.buffer;
        allImageSizes[key] = [imageData.width, imageData.height];
        console.log(`Added chart image ${key}: ${imageData.buffer.byteLength} bytes`);
      }

      // Add static images
      if (staticImages) {
        for (const [key, imageInfo] of Object.entries(staticImages)) {
          console.log(`Loading static image ${key} from ${imageInfo.path}`);
          const buffer = await this.http.get(imageInfo.path, { responseType: 'arraybuffer' }).toPromise();
          allImageBuffers[key] = buffer as ArrayBuffer;
          allImageSizes[key] = [imageInfo.width, imageInfo.height];
          console.log(`Loaded static image ${key}: ${buffer.byteLength} bytes`);
        }
      }

      // Merge report data with all image buffers
      const data = { ...reportData, ...allImageBuffers };

      // Load template
      const content = await this.http.get(this.templateUrl, { responseType: 'arraybuffer' }).toPromise();
      const zip = new PizZip(content);

      // Configure image options
      const imageOptions = {
        centered: true,
        getImage: (tagValue: ArrayBuffer) => {
          console.log('Processing image buffer, size:', tagValue.byteLength);
          return tagValue;
        },
        getSize: (img: ArrayBuffer, tagValue: any, tagName: string) => {
          console.log('Getting size for:', tagName);
          return allImageSizes[tagName] || [400, 300];
        }
      };

      // Initialize docxtemplater
      const imageModule = new ImageModule(imageOptions);
      const doc = new Docxtemplater();

      doc.attachModule(imageModule);
      doc.loadZip(zip);
      doc.setOptions({
        paragraphLoop: true,
        linebreaks: true
      });

      doc.setData(data);
      doc.render();

      // Generate and save the document
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      saveAs(out, `report_${timestamp}.docx`);

      console.log('Document exported successfully!');

    } catch (err) {
      console.error('Export error:', err);
      throw err;
    }
  }

  // SVG conversion method
  // public async svgToArrayBuffer(svgString: string, width: number, height: number): Promise<ArrayBuffer> {
  //   return new Promise((resolve, reject) => {
  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
  //     const img = new Image();
  //
  //     canvas.width = width;
  //     canvas.height = height;
  //
  //     img.onload = () => {
  //       if (ctx) {
  //         ctx.fillStyle = 'white';
  //         ctx.fillRect(0, 0, width, height);
  //         ctx.drawImage(img, 0, 0, width, height);
  //
  //         canvas.toBlob((blob) => {
  //           if (blob) {
  //             const reader = new FileReader();
  //             reader.onload = () => resolve(reader.result as ArrayBuffer);
  //             reader.readAsArrayBuffer(blob);
  //           } else {
  //             reject(new Error('Failed to create blob from canvas'));
  //           }
  //         }, 'image/png');
  //       } else {
  //         reject(new Error('Canvas context not available'));
  //       }
  //     };
  //
  //     img.onerror = () => reject(new Error('Failed to load SVG'));
  //
  //     const blob = new Blob([svgString], { type: 'image/svg+xml' });
  //     img.src = URL.createObjectURL(blob);
  //   });
  // }

  // SVG conversion method with cleanup
  public async svgToArrayBuffer(svgString: string, width: number, height: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      // 1) Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // 2) Create an image with CORS
      const img = new Image();
      img.crossOrigin = 'anonymous'; // prevents your canvas from becoming “tainted” if any linked resources leak in.

      // 3) When the image loads, draw and clean up
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // 4) Revoke the blob URL
        URL.revokeObjectURL(img.src); // after load ensure you don’t exhaust the browser’s blob URL pool

        // 5) Export to blob & ArrayBuffer
        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Canvas toBlob failed'));
          const reader = new FileReader();
          reader.onload = () => {
            // 6) Clean up canvas element
            // > 2. Clean up a canvas element to free the DOM node so no element‑count limits are hit.
            canvas.remove(); // frees the DOM node so you don’t hit element‑count limits.
            resolve(reader.result as ArrayBuffer);
          };
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load SVG as image'));
      };

      // 7) Kick off the load
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
      img.src = URL.createObjectURL(svgBlob);
    });
  }

}
