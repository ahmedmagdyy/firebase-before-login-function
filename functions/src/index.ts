import "dotenv/config";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.beforeSignIn = functions.auth
    .user()
    .beforeSignIn(async (user, _context) => {
      const customClaims = {
        "https://hasura.io/jwt/claims": {
          "x-hasura-default-role": "user",
          "x-hasura-allowed-roles": ["user"],
          "x-hasura-user-id": user.uid,
        },
      };

      const operation = "contact";
      const query = `
      query contact($email: String) {
        Contact(where: {
          emailAddress: {_eq: $email},
          state: {_eq: "Active"},
          user: {state: {_eq: "Active"}}
        }) {
          contactId
          emailAddress
          user {
            userId
            userRoles(where: {role: {state: {_eq: "Active"}}}) {
              companyId
              role {
                role
              }
            }
          }
        }
      }
    `;
      const variables = {
        email: user.email,
      };

      const response = await axios.post(
      process.env.HASURA_END_POINT as string,
      {
        operation,
        query,
        variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET as string,
        },
      }
      );

      const result = response.data;
      if (!result?.data?.Contact?.length) {
        return;
      }
      const userInfo = result?.data?.Contact?.[0];
      customClaims["https://hasura.io/jwt/claims"]["x-hasura-user-id"] =
      userInfo.user.userId;
      return admin.auth().setCustomUserClaims(user.uid, customClaims);
    });
