-- Insert Remaining California VA Facilities
-- This script inserts the remaining California VA facilities that didn't fit in the first script

INSERT INTO va_facilities (name, city, state, type, visn, full_address, zip_code) VALUES
-- Remaining California Facilities
('Sacramento VA Medical Center', 'Mather', 'CA', 'Medical Center', 'VISN 21', '10535 Hospital Way', '95655-4200'),
('Mare Island VA Clinic', 'Mare Island', 'CA', 'Outpatient Clinic', 'VISN 21', '201 Walnut Avenue, Building 201', '94592-1107'),
('Major General William H. Gourley VA-DoD Outpatient Clinic', 'Marina', 'CA', 'Outpatient Clinic', 'VISN 21', '201 9th Street', '93933-6039'),
('Martinez VA Medical Center', 'Martinez', 'CA', 'Medical Center', 'VISN 21', '150 Muir Road', '94553-4668'),
('McClellan VA Clinic', 'McClellan Park', 'CA', 'Outpatient Clinic', 'VISN 21', '5342 Dudley Boulevard, Building 98', '95652-1012'),
('Palo Alto VA Medical Center Menlo Park', 'Menlo Park', 'CA', 'Medical Center', 'VISN 21', '795 Willow Road', '94025-2539'),
('Merced VA Clinic', 'Merced', 'CA', 'Outpatient Clinic', 'VISN 21', '340 East Yosemite Avenue, Suite D', '95340-9167'),
('Modesto VA Clinic', 'Modesto', 'CA', 'Outpatient Clinic', 'VISN 21', '1225 Oakdale Road', '95355-3357'),
('Murrieta VA Clinic', 'Murrieta', 'CA', 'Outpatient Clinic', 'VISN 22', '25125 Madison Avenue, Suite 105', '92562-8970'),
('Oakland VA Clinic', 'Oakland', 'CA', 'Outpatient Clinic', 'VISN 21', '2221 Martin Luther King Jr. Way', '94612-1318'),
('Twenty-First Street VA Clinic', 'Oakland', 'CA', 'Outpatient Clinic', 'VISN 21', '525 21st Street', '94612-1605'),
('Oceanside VA Clinic', 'Oceanside', 'CA', 'Outpatient Clinic', 'VISN 22', '1300 Rancho del Oro Drive', '92056-1729'),
('Oakhurst VA Clinic', 'Oakhurst', 'CA', 'Outpatient Clinic', 'VISN 21', '40597 Westlake Drive', '93644-9024'),
('Sy Kaplan VA Clinic', 'Palm Desert', 'CA', 'Outpatient Clinic', 'VISN 22', '72700 Dinah Shore Drive, Suite 200', '92211-9329'),
('Palo Alto VA Medical Center', 'Palo Alto', 'CA', 'Medical Center', 'VISN 21', '3801 Miranda Avenue', '94304-1207'),
('Placentia VA Clinic', 'Placentia', 'CA', 'Outpatient Clinic', 'VISN 22', '770 South Placentia Avenue', '92870-6832'),
('Rancho Cucamonga VA Clinic', 'Rancho Cucamonga', 'CA', 'Outpatient Clinic', 'VISN 22', '8160 Day Creek Boulevard, Suite 120', '91739-9329'),
('Cypress Avenue VA Clinic', 'Redding', 'CA', 'Outpatient Clinic', 'VISN 21', '760 Cypress Avenue, Suite 100', '96001-2732'),
('Redding VA Clinic', 'Redding', 'CA', 'Outpatient Clinic', 'VISN 21', '3455 Knighton Road', '96002-9498'),
('Loma Linda VA Clinic', 'Redlands', 'CA', 'Outpatient Clinic', 'VISN 22', '26001 Redlands Boulevard, Ambulatory Care Center', '92373-7762'),
('North Loma Linda VA Clinic', 'Redlands', 'CA', 'Outpatient Clinic', 'VISN 22', '10391 Corporate Drive', '92374-4509'),
('San Bruno VA Clinic', 'San Bruno', 'CA', 'Outpatient Clinic', 'VISN 21', '1001 Sneath Lane, Suite 300', '94066-2349'),
('Jennifer Moreno VA Medical Center', 'San Diego', 'CA', 'Medical Center', 'VISN 22', '3350 La Jolla Village Drive', '92161-0002'),
('Kearny Mesa VA Clinic', 'San Diego', 'CA', 'Outpatient Clinic', 'VISN 22', '8875 Aero Drive', '92123-2251'),
('Rio VA Clinic', 'San Diego', 'CA', 'Outpatient Clinic', 'VISN 22', '8989 Rio San Diego Drive, Suite 350', '92108-1605'),
('San Diego VA Domiciliary', 'San Diego', 'CA', 'Outpatient Clinic', 'VISN 22', '2121 San Diego Avenue, The Aspire Center', '92110-2928'),
('Sorrento Valley VA Clinic', 'San Diego', 'CA', 'Outpatient Clinic', 'VISN 22', '10455 Sorrento Valley Road, Suite 210', '92121-1622'),
('San Francisco VA Medical Center', 'San Francisco', 'CA', 'Medical Center', 'VISN 21', '4150 Clement Street', '94121-1545'),
('San Francisco VA Clinic', 'San Francisco', 'CA', 'Outpatient Clinic', 'VISN 21', '401 3rd Street, Community Resource & Referral Center (CRRC)', '94107-1214'),
('San Gabriel Valley VA Clinic', 'San Gabriel Valley', 'CA', 'Outpatient Clinic', 'VISN 22', '7 West Foothill Boulevard, Suite D', '91006-2367'),
('San Jose VA Clinic', 'San Jose', 'CA', 'Outpatient Clinic', 'VISN 21', '5855 Silver Creek Valley Place', '95138-1059'),
('San Luis Obispo VA Clinic', 'San Luis Obispo', 'CA', 'Outpatient Clinic', 'VISN 22', '1288 Morro Street, Suite 200', '93401-6302'),
('North Santa Rosa VA Clinic', 'Santa Rosa', 'CA', 'Outpatient Clinic', 'VISN 21', '3841 Brickway Boulevard', '95403-8226'),
('South Santa Rosa VA Clinic', 'Santa Rosa', 'CA', 'Outpatient Clinic', 'VISN 21', '2285 Challenger Way', '95407-5418'),
('Santa Ana VA Clinic', 'Santa Ana', 'CA', 'Outpatient Clinic', 'VISN 22', '1506 Brookhollow Drive, Suite 100', '92705-5405'),
('West Santa Ana VA Clinic', 'Santa Ana', 'CA', 'Outpatient Clinic', 'VISN 22', '888 West Santa Ana Boulevard, Suite 150, Community Resource & Referral Center (CRRC)', '92701-4561'),
('Santa Barbara VA Clinic', 'Santa Barbara', 'CA', 'Outpatient Clinic', 'VISN 22', '4440 Calle Real', '93110-1002'),
('Santa Fe Springs VA Clinic', 'Santa Fe Springs', 'CA', 'Outpatient Clinic', 'VISN 22', '10330 Pioneer Boulevard, Suite 180', '90670-6012'),
('Santa Maria VA Clinic', 'Santa Maria', 'CA', 'Outpatient Clinic', 'VISN 22', '1550 East Main Street', '93454-4819'),
('Sepulveda VA Medical Center', 'Sepulveda', 'CA', 'Medical Center', 'VISN 22', '16111 Plummer Street, Sepulveda Ambulatory Care Center', '91343-2036'),
('Sonora VA Clinic', 'Sonora', 'CA', 'Outpatient Clinic', 'VISN 21', '13663 Mono Way', '95370-2811'),
('Ukiah VA Clinic', 'Ukiah', 'CA', 'Outpatient Clinic', 'VISN 21', '630 Kings Court', '95482-5003'),
('Captain Rosemary Bryant Mariner Outpatient Clinic', 'Ventura', 'CA', 'Outpatient Clinic', 'VISN 22', '5250 Ralston Street', '93003-7318'),
('Victorville VA Clinic', 'Victorville', 'CA', 'Outpatient Clinic', 'VISN 22', '14598 Seventh Street, Suite B', '92395-4214'),
('Visalia VA Clinic', 'Visalia', 'CA', 'Outpatient Clinic', 'VISN 21', '500 North Santa Fe Street', '93292-5065'),
('Yreka VA Clinic', 'Yreka', 'CA', 'Outpatient Clinic', 'VISN 21', '101 East Oberlin Road', '96097-9645'),
('Yuba City VA Clinic', 'Yuba City', 'CA', 'Outpatient Clinic', 'VISN 21', '425 Plumas Boulevard', '95991-5074')
ON CONFLICT (name) DO NOTHING;

-- Show summary of all California facilities
SELECT 
    'CA' as state,
    COUNT(*) as facility_count,
    COUNT(CASE WHEN type = 'Medical Center' THEN 1 END) as medical_centers,
    COUNT(CASE WHEN type = 'Outpatient Clinic' THEN 1 END) as outpatient_clinics
FROM va_facilities 
WHERE state = 'CA'
    AND created_at >= NOW() - INTERVAL '1 hour'; 