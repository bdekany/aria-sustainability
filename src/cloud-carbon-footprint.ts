export type AwsCpu = {
    'CPU Name': string,
    'Platform Total Number of vCPU': number,
    'Platform Number of CPU Socket(s)': number,
    'Total Number of vCPU per socket': number
  }
  
export type AzureCpu = {
    'Microarchitecture': string,
    'Platform vCPUs': number,
    'CPU Sockets': number
  }
  
export type AwsInstance = {
    'Instance type': string,
    'Release Date': string,
    'Instance vCPU': string,
    'Platform Total Number of vCPU': string,
    'Platform CPU Name': string,
    'Instance Memory (in GB)': string,
    'Platform Memory (in GB)': string,
    'Storage Info (Type and Size in GB)': string,
    'Storage Type': string,
    'Platform Storage Drive Quantity': string,
    'Platform GPU Quantity': string,
    'Platform GPU Name': string,
    'Instance Number of GPU': string,
    'Instance GPU memory (in GB)': string,
    'PkgWatt @ Idle': string,
    'PkgWatt @ 10%': string,
    'PkgWatt @ 50%': string,
    'PkgWatt @ 100%': string,
    'RAMWatt @ Idle': string,
    'RAMWatt @ 10%': string,
    'RAMWatt @ 50%' :string,
    'RAMWatt @ 100%': string,
    'GPUWatt @ Idle': string,
    'GPUWatt @ 10%': string,
    'GPUWatt @ 50%': string,
    'GPUWatt @ 100%': string,
    'Delta Full Machine': string,
    'Instance @ Idle': string,
    'Instance @ 10%': string,
    'Instance @ 50%': string,
    'Instance @ 100%': string,
    'Hardware Information on AWS Documentation & Comments': string
  }
  
export type AzureInstance = {
    'Series': string,
    'Virtual Machine': string,
    'Microarchitecture': string,
    'Instance vCPUs': string,
    'Instance Memory': string,
    'Platform vCPUs (highest vCPU possible)': string,
    'Platform Memory': string,
    'Platform Storage Info (SSD?)': string,
    'Platform Storage Type': string,
    'Platform (largest instance) Storage Drive quantity': string,
    'Instance GPUs': string,
    'Platform GPU': string
  }