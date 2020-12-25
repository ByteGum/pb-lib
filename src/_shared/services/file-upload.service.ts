import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

/**
 * Builds email job
 * and adds to @{WorkerQueues.PROCESS_EMAIL} queue for processing
 *
 */
@Injectable()
export class FileUploadService {
  constructor(private config: ConfigService) {
  }

  /**
   * @param {Object} payload The payload object
   * @param {Object} options The payload object
   * @return {Object}
   */
  async uploadToS3(payload, options: any = {}) {
    try {
      const bucketName = this.config.get('service.s3.bucket');
      const s3FileName = `${Date.now()}-${payload.name}`;
      console.log('bucketName ::::: ', bucketName);
      const s3 = new S3({
        accessKeyId: this.config.get('service.s3.key'),
        secretAccessKey: this.config.get('service.s3.secret'),
      });
      const params = {
        Bucket: bucketName,
        Key: String(s3FileName),
        Body: payload.body,
        ...options,
      };
      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            Logger.error(err);
            reject(err.message);
          }
          resolve(data);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Object} uploaded The payload object
   * @param {Object} options The payload object
   * @return {Object}
   */
  async uploadToGCS(payload, options: any = {}) {
    try {
      const bucketName = this.config.get('service.gcs.bucket');
      const storage = new Storage({
        projectId: this.config.get('service.gcs.projectId'),
        keyFilename: this.config.get('service.gcs.keyFile'),
        ...options,
      });
      const bucket = storage.bucket(bucketName);
      const gcsFileName = `${Date.now()}-${payload.name}`;
      const file = bucket.file(gcsFileName);
      return new Promise((resolve, rejects) => {
        const stream = file.createWriteStream({
          metadata: {
            contentType: payload.contentType,
          },
        });
        stream.on('error', (err) => {
          rejects(err);
        });
        stream.on('finish', async () => {
          await file.makePublic();
          const url = this.getPublicUrl(bucketName, gcsFileName);
          resolve(url);
        });
        stream.end(payload.body);
      });
    } catch (e) {
      throw e;
    }
  }

  getPublicUrl = (bucketName, fileName) =>
    `https://storage.googleapis.com/${bucketName}/${fileName}`;
}
