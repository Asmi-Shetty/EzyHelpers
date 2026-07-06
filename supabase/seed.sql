begin;

insert into public.localities (locality, pincode, district, rep_lat, rep_lon, state, apartment_count) values
('Koramangala','560034','Bangalore Urban',12.9352,77.6245,'Karnataka',2),
('Indiranagar','560038','Bangalore Urban',12.9784,77.6408,'Karnataka',0),
('HSR Layout','560102','Bangalore Urban',12.9121,77.6389,'Karnataka',0),
('BTM Layout','560076','Bangalore Urban',12.9166,77.6101,'Karnataka',0),
('Whitefield','560066','Bangalore Urban',12.9698,77.7427,'Karnataka',7),
('Marathahalli','560037','Bangalore Urban',12.9609,77.7045,'Karnataka',2),
('Bellandur','560103','Bangalore Urban',12.9296,77.6839,'Karnataka',4),
('Electronics City','560100','Bangalore Urban',12.8480,77.6551,'Karnataka',0),
('JP Nagar','560078','Bangalore Urban',12.9063,77.5857,'Karnataka',0),
('Yelahanka','560064','Bangalore Urban',13.1007,77.5963,'Karnataka',0),
('Mahadevapura','560048','Bangalore Urban',12.9927,77.7031,'Karnataka',1),
('Sarjapur Road','560034','Bangalore Urban',12.9088,77.6757,'Karnataka',1),
('Kalyananagar','560043','Bangalore Urban',13.0279,77.6513,'Karnataka',1),
('Bannerghatta Road','560076','Bangalore Urban',12.8868,77.6057,'Karnataka',1),
('Kasavanahalli','560035','Bangalore Urban',12.9048,77.6821,'Karnataka',1)
on conflict (locality) do update set pincode=excluded.pincode,district=excluded.district,rep_lat=excluded.rep_lat,rep_lon=excluded.rep_lon,state=excluded.state,apartment_count=excluded.apartment_count;

insert into public.apartments (name, locality, lat, lon, coordinate_quality) values
('Prestige Ozone','Whitefield',12.9598,77.7479,'exact'),
('Sobha Dream Acres','Bellandur',12.9391,77.7377,'exact'),
('Embassy Pristine','Bellandur',12.9210,77.6770,'exact'),
('Salarpuria Sanctity','Marathahalli',12.9110,77.6818,'exact'),
('Prestige Shantiniketan','Whitefield',12.9889,77.7291,'exact'),
('Akme Harmony','Bellandur',12.9229,77.6707,'exact'),
('GR One And Only','Kasavanahalli',12.8900,77.6765,'exact'),
('L&T South City','Bannerghatta Road',12.8870,77.5960,'exact'),
('Adarsh Palm Meadows','Whitefield',12.9627,77.7394,'exact'),
('Godrej Air','Whitefield',12.9875,77.7117,'exact'),
('Prestige Kingfisher Towers','Koramangala',12.9726,77.5963,'exact'),
('Prestige Lakeside Habitat','Whitefield',12.8980,77.7370,'exact'),
('Keerthi Signature','Whitefield',12.9750,77.7250,'exact'),
('Prestige White Meadows','Whitefield',12.9749,77.7508,'exact'),
('DNR Springleaf','Koramangala',12.9320,77.6340,'exact'),
('Greenwood Regency','Mahadevapura',12.9719,77.6594,'exact'),
('Purva Skydale','Bellandur',12.8939,77.6623,'exact'),
('Nagarjuna Green Ridge','Sarjapur Road',12.9155,77.6388,'exact'),
('SMR Vinay Estate','Kalyananagar',13.0000,77.6400,'exact'),
('Sumadhura Shikharam','Marathahalli',13.0153,77.7003,'exact')
on conflict (name, locality) do update set lat=excluded.lat,lon=excluded.lon,coordinate_quality=excluded.coordinate_quality;

commit;
