
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Import AWS SDK v3
import { EC2Client, TerminateInstancesCommand } from "https://esm.sh/@aws-sdk/client-ec2@3.462.0";
import { RDSClient, DeleteDBInstanceCommand } from "https://esm.sh/@aws-sdk/client-rds@3.462.0";
import { S3Client, DeleteBucketCommand } from "https://esm.sh/@aws-sdk/client-s3@3.462.0";

const handleError = (error: any, message: string) => {
  console.error(message, error);
  return new Response(
    JSON.stringify({
      success: false,
      error: `${message}: ${error.message || 'Unknown error'}`
    }),
    {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
};

const terminateAwsResource = async (resourceId: string, credentials: any) => {
  const awsConfig = {
    region: credentials.region || 'us-east-1',
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
    }
  };

  if (resourceId.startsWith('i-')) {
    // EC2 Instance
    const ec2Client = new EC2Client(awsConfig);
    const command = new TerminateInstancesCommand({
      InstanceIds: [resourceId]
    });
    
    await ec2Client.send(command);
    return { success: true, message: 'EC2 instance termination initiated' };
  } else if (resourceId.includes('db-')) {
    // RDS Instance
    const rdsClient = new RDSClient(awsConfig);
    const command = new DeleteDBInstanceCommand({
      DBInstanceIdentifier: resourceId,
      SkipFinalSnapshot: true
    });
    
    await rdsClient.send(command);
    return { success: true, message: 'RDS instance deletion initiated' };
  } else {
    // S3 Bucket
    const s3Client = new S3Client(awsConfig);
    const command = new DeleteBucketCommand({
      Bucket: resourceId
    });
    
    await s3Client.send(command);
    return { success: true, message: 'S3 bucket deleted' };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { accountId, provider, resourceId, credentials } = await req.json();
    
    console.log(`Terminating ${resourceId} on ${provider}`);
    
    let result;
    
    switch (provider) {
      case 'aws':
        result = await terminateAwsResource(resourceId, credentials);
        break;
      case 'azure':
        result = { success: false, error: 'Azure termination not implemented yet' };
        break;
      case 'gcp':
        result = { success: false, error: 'GCP termination not implemented yet' };
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return handleError(error, "Error terminating resource");
  }
});
