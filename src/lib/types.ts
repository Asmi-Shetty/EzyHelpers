export type Locality={id:number;locality:string;district:string;pincode:string;state:string;rep_lat:number;rep_lon:number;apartment_count:number};
export type Apartment={id:number;name:string;locality:string;lat:number;lon:number;coordinate_quality:'exact'|'approximate'};
export type TransitType='metro'|'bus'|'railway'|'taxi';
export type TransitPoi={id:string;type:TransitType;name:string;lat:number;lon:number};
