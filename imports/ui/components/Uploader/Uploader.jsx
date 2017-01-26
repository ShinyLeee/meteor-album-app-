import { Meteor } from 'meteor/meteor';
import React, { PureComponent, PropTypes } from 'react';
import EXIF from 'exif-js';
import uuid from 'node-uuid';
import { insertImage } from '/imports/api/images/methods.js';

const initialState = {
  pace: 0,               // Current File Uploading Progress
  current: 0,           // Current Uploading file
  total: 1,            // total Uploading files length
  thumbnail: '',      // Current Uploading thumbnail
  uploading: false,  // Is in Uploading Progress
};

export default class Uploader extends PureComponent {

  constructor(props) {
    super(props);
    this.state = initialState;
    this.handleImageChange = this.handleImageChange.bind(this);
  }

  handleImageChange(e) {
    e.preventDefault();
    const files = [...e.target.files];
    this.setState({
      total: files.length,
      uploading: true,
    }, () => {
      if (this.props.beforeUpload) {
        this.props.beforeUpload(files);
      }
      this.uploadToQiniu(files);
    });
  }

  uploadToQiniu(files, currentFile) {
    if (!files) {
      console.error('File is empty, check if miss select upload files'); // eslint-disable-line no-console
    }

    const allowedFiles = ['image/jpeg', 'image/png', 'image/gif'];

    const f = currentFile || files[0];

    // If upload not allowedFiles, We need stop upload.
    if (allowedFiles.indexOf(f.type) < 0) {
      this.props.uploaderStop();
      this.props.snackBarOpen('只允许上传.jpg .png或.gif文件');
      return;
    } else if (allowedFiles.indexOf(f.type) === 0) f.surfix = 'jpg';
    else if (allowedFiles.indexOf(f.type) === 1) f.surfix = 'png';
    else if (allowedFiles.indexOf(f.type) === 2) f.surfix = 'gif';

    const formData = new FormData();
    const fileName = uuid.v4();

    this.setState({
      current: this.state.current + 1,
      thumbnail: URL.createObjectURL(f),
    }, () => {
      formData.append('file', f);
      formData.append('key', `${this.props.destination}${fileName}.${f.surfix}`);
      formData.append('token', this.props.token);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        let ratio = width / height;
        ratio = Math.round(ratio * 100) / 100;

        // We need to store image's ratio and lastModified in local DB
        f.fileName = fileName;
        f.ratio = ratio;
        const startAjax = () => {
          $.ajax({
            xhr: () => {
              const xhr = new window.XMLHttpRequest();
              xhr.upload.addEventListener('progress', (evt) => {
                this.fileUploading(evt, xhr);
              }, false);
              xhr.addEventListener('progress', (evt) => {
                this.fileUploading(evt, xhr);
              }, false);
              return xhr;
            },
            method: 'POST',
            url: this.props.uploadURL,
            data: formData,
            dataType: 'json',
            contentType: false,
            processData: false,
          })
          .done((res) => {
            f.key = res.key;
            if (this.afterUploadFile(f)) {
              // if have upload all files, just call finishUpload without error
              if (this.state.current === this.state.total) {
                this.finishUpload(null);
              } else {
                // if have not upload all files, we need to call it again
                this.uploadToQiniu(files, files[this.state.current]);
              }
            }
          })
          .fail((err) => {
            this.finishUpload(err);
          });
        };

        // 如果MIME-TYPE不是image/jpeg，则无法提取exif信息
        if (f.surfix !== 'jpg') {
          f.shootAt = f.lastModified;
          startAjax();
          return;
        }
        // Fix lastModified property not support by safari
        EXIF.getData(img, function () {  // eslint-disable-line
          const dateTime = EXIF.getTag(this, 'DateTime');
          const dateTimeOriginal = EXIF.getTag(this, 'DateTimeOriginal');
          const dateTimeDigitized = EXIF.getTag(this, 'DateTimeDigitized');
          const exifTime = dateTime || dateTimeOriginal || dateTimeDigitized;

          // 若该图片存在时间信息，则保存为拍摄时间
          if (exifTime) {
            const temp = exifTime.split(' ');
            temp[0] = temp[0].split(':').join('-');
            f.shootAt = new Date(`${temp[0]}T${temp[1]}`);
            startAjax();
            return;
          }
          f.shootAt = f.lastModified;
          startAjax();
        });
      };

      img.src = this.state.thumbnail;
    });
  }

  fileUploading(e, xhr) {
    if (this.stopButton) {
      this.stopButton.addEventListener('click', (event) => {
        this.stopUploading(event, xhr);
      }, false);
    }
    if (e.lengthComputable) {
      const percentComplete = e.loaded / e.total;
      const pace = `${Math.round(percentComplete * 100)}%`;
      this.setState({ pace });
      console.log(pace); // eslint-disable-line no-console
    }
  }

  afterUploadFile(file) {
    const image = {
      user: this.props.User.username,
      collection: this.props.destination.split('/')[1],
      name: file.fileName,
      type: file.surfix,
      ratio: file.ratio,
      shootAt: file.shootAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return insertImage.call(image, (err) => {
      if (err) {
        this.props.uploaderStop();
        this.props.snackBarOpen(err.message);
      }
    });
  }

  finishUpload(err) {
    if (err) {
      this.setState(initialState);
      this.props.uploaderStop();
      this.props.snackBarOpen('上传失败');
      if (this.props.afterUpload) {
        this.props.afterUpload(err);
      }
      throw new Meteor.Error(err);
    }

    this.props.uploaderStop();
    this.props.snackBarOpen(`成功上传${this.state.total}个文件`);
    this.setState(initialState);
    if (this.props.afterUpload) {
      this.props.afterUpload(null);
    }
    return;
  }

  stopUploading(e, xhr) {
    e.preventDefault();
    if (xhr && xhr.readyState !== 4) {
      xhr.abort();
      const stopMsg = `您取消了上传文件, 已成功上传${this.state.current}个文件`;
      this.setState(initialState);
      this.props.uploaderStop();
      this.props.snackBarOpen(stopMsg);
    }
  }

  render() {
    if (this.props.open && this.state.uploading) {
      return (
        <div>
          <div className="component__Uploader">
            <div className="Uploader__container">
              <div className="Uploader__thumbnails" style={{ backgroundImage: `url(${this.state.thumbnail})` }} />
              <div className="Uploader__details">
                <span>正在上传至</span>
                <h4>{ this.props.destination.split('/')[1] }</h4>
                <span>第{this.state.current}张, 共{this.state.total}张</span>
                <a className="Uploader__stop" ref={(ref) => { this.stopButton = ref; }}>停止</a>
                <div className="Uploader__pace" style={{ width: this.state.pace }} />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <input
          id="Uploader__container"
          type="file"
          style={{ display: 'none' }}
          onChange={this.handleImageChange}
          ref={(ref) => { this.filesInput = ref; }}
          multiple={this.props.multiple}
          accept="image/*"
        />
      </div>
    );
  }
}

Uploader.displayName = 'Uploader';

Uploader.defaultProps = {
  open: false,
  multiple: false,
  uploadURL: window.location.protocol === 'https:' ? 'https://up.qbox.me/' : 'http://upload.qiniu.com',
};

Uploader.propTypes = {
  User: PropTypes.object,
  open: PropTypes.bool.isRequired,
  /**
   * uploadURL:
   * eg: https://up.qbox.me/, http://upload.qiniu.com.
   */
  uploadURL: PropTypes.string.isRequired,
  multiple: PropTypes.bool.isRequired,
  beforeUpload: PropTypes.func,
  afterUpload: PropTypes.func,
  // Below Pass from Redux
  /**
   * destination:
   *
   * Composed by Username and Collection name,
   * eg: ShinyLee/风景.
   */
  token: PropTypes.string,        // not required bc don't need it before Uploading
  destination: PropTypes.string,  // not required bc don't need it before Uploading
  snackBarOpen: PropTypes.func.isRequired,
  uploaderStop: PropTypes.func.isRequired,
};
