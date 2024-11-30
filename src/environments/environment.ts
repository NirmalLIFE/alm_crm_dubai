/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  base_url: 'http://localhost:8081/',
  base_img_url: 'http://localhost:8081/uploads/',
  yeastar_url: 'https://almaraghidxb.ras.yeastar.com/openapi/v1.0/',
  firebase: {
      apiKey: 'AIzaSyBBKv_LdCNFhr4IMr9Msq5NXLU_lvx2mxY',
      authDomain: 'maraghi-crm.firebaseapp.com',
      projectId: 'maraghi-crm',
      storageBucket: 'maraghi-crm.appspot.com',
      messagingSenderId: '1062000739352',
      appId: '1:1062000739352:web:fd5d6e73bfca0d90752f6d',
      vapidKey: 'BEv7DNp4_RMRe7LLtjiFCiOYtVmkGQ5Yj_TO9Gvwgd49hQIhv-YELG2RcZmfq9gG5X0LkAx88xSwBgP0MOtQBGU',
  },
  SOCKET_ENDPOINT: 'http://localhost:3000/',
  //SOCKET_ENDPOINT: "https://chatramsserver-production.up.railway.app/"
};

// export const environment = {
//     production: true,
//     base_url:"https://benzuae.ae/crm_api_dxb/",
//     base_img_url:"https://benzuae.ae/crm_api_dxb/uploads/",
//     yeastar_url:"https://almaraghidxb.ras.yeastar.com/openapi/v1.0/",
//     firebase: {
//       apiKey: "AIzaSyBBKv_LdCNFhr4IMr9Msq5NXLU_lvx2mxY",
//       authDomain: "maraghi-crm.firebaseapp.com",
//       projectId: "maraghi-crm",
//       storageBucket: "maraghi-crm.appspot.com",
//       messagingSenderId: "1062000739352",
//       appId: "1:1062000739352:web:fd5d6e73bfca0d90752f6d",
//       vapidKey: "BEv7DNp4_RMRe7LLtjiFCiOYtVmkGQ5Yj_TO9Gvwgd49hQIhv-YELG2RcZmfq9gG5X0LkAx88xSwBgP0MOtQBGU"
//     },
//     SOCKET_ENDPOINT: "https://chatramsserver-production.up.railway.app/"
//   };
