const { CognitoJwtVerifier } = require("aws-jwt-verify");
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "id",
  clientID: COGNITO_CLIENT_ID,
});

const generatePolicy = (principalId, effect, resource) => {
  var authResponse = {};
  authResponse.principalId = principalId;

  if (effect && resource) {
    let policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: effect,
          Resource: resource,
          Action: "execute-api:Invoke",
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }

  authResponse.context = {
    stringKey: "stringval",
  };

  console.log(JSON.stringify(authResponse));

  return authResponse;
};

exports.handler = async (event) => {
  var token = event.authorizationToken; // 'allow' or 'deny'
  console.log("token: ", token);

  try {
    const payload = await jwtVerifier.verify(token);
    console.log("payload: ", JSON.stringify(payload));
    return generatePolicy("user", "Allow", event.methodArn);
  } catch (error) {
    console.log("error: ", error);
    return generatePolicy("user", "Deny", event.methodArn);
  }
};
