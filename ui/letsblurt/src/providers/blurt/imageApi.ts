import axios from 'axios';
import Config from 'react-native-config';
import {BLURT_IMAGE_SERVERS} from '~/constants/blockchain';
//const IMAGE_API = BLURT_IMAGE_SERVERS[0];

//// upload image
export const uploadImage = (
  media,
  username: string,
  sign,
  imageServer: string = BLURT_IMAGE_SERVERS[0],
) => {
  const file = {
    uri: media.path,
    type: media.mime,
    name: media.filename || `img_${Math.random()}.jpg`,
    size: media.size,
  };

  const fData = new FormData();
  fData.append('file', file);

  return _upload(fData, username, sign, imageServer);
};

const _upload = (
  fd,
  username: string,
  signature,
  imageServer: string = BLURT_IMAGE_SERVERS[0],
) => {
  console.log(
    '[imageApi|_upload] baseURL',
    `${imageServer}/${username}/${signature}`,
  );
  const image = axios.create({
    baseURL: `${imageServer}/${username}/${signature}`,
    headers: {
      Authorization: imageServer,
      'Content-Type': 'multipart/form-data',
    },
  });
  return image.post('', fd);
};

//// upload image
// e.g. "profile_image":"https://images.blurt.buzz/DQmP1NegAx2E3agYjgdzn4Min9eVVxSdyXxgQ2DWLwHBKbi/helpus_icon.png"
// export const uploadProfileImage = (media, username: string, signature) => {
//   const file = {
//     uri: media.path,
//     type: media.mime,
//     name: media.filename || `img_${Math.random()}.jpg`,
//     size: media.size,
//   };

//   const fData = new FormData();
//   fData.append('file', file);

//   console.log(
//     '[imageApi|_upload] baseURL',
//     `${PROFILE_IMAGE_API}/${signature}`,
//   );
//   const image = axios.create({
//     baseURL: `${PROFILE_IMAGE_API}/${signature}/${media.filename}`,
//     headers: {
//       Authorization: PROFILE_IMAGE_API,
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return image.post('', fData);
// };
