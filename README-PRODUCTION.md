# Police Care Interview System v3.0 Production

ระบบสัมภาษณ์อัตโนมัติสำหรับผู้พิการทางการได้ยิน พัฒนาด้วย PHP + MySQL + JavaScript

## 🏗️ โครงสร้างระบบ

```
g:\Demo-pl\
├── config\
│   └── database.php          # การตั้งค่าฐานข้อมูล
├── api\
│   └── index.php            # RESTful API endpoints
├── models\
│   ├── ReportModel.php      # Model สำหรับรายงาน
│   └── ScenarioModel.php    # Model สำหรับสถานการณ์
├── utils\
│   ├── ResponseHelper.php   # Helper สำหรับ API response
│   └── ValidationHelper.php # Helper สำหรับ validation
├── middleware\
│   └── AuthMiddleware.php  # Authentication middleware
├── public\
│   ├── index.html          # หน้าแรกของระบบ
│   └── js\
│       └── production-app.js # Frontend JavaScript
├── setup.sql               # SQL script สำหรับติดตั้งฐานข้อมูล
└── README-PRODUCTION.md    # ไฟล์นี้
```

## 🚀 การติดตั้ง

### 1. ติดตั้งฐานข้อมูล

```bash
# สร้างฐานข้อมูลและตาราง
mysql -u root -p < setup.sql
```

### 2. ตั้งค่าฐานข้อมูล

แก้ไขไฟล์ `config/database.php`:

```php
private $host = 'localhost';
private $db_name = 'police_care_interview';
private $username = 'root';
private $password = '12345;
```

### 3. ตั้งค่า Web Server

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ api/index.php/$1 [L,QSA]
```

#### Nginx
```nginx
location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

### 4. ตั้งค่า Permissions

```bash
chmod 755 public/
chmod 644 public/index.html
chmod 644 public/js/production-app.js
```

## 📡 API Endpoints

### GET `/api/health`
ตรวจสอบสถานะระบบ

### GET `/api/scenarios`
ดึงข้อมูลสถานการณ์ทั้งหมด

### GET `/api/scenarios/{id}`
ดึงข้อมูลสถานการณ์ตาม ID

### GET `/api/reports`
ดึงข้อมูลรายงานทั้งหมด (พร้อม pagination)

### POST `/api/reports`
สร้างรายงานใหม่

### GET `/api/reports/{id}`
ดึงข้อมูลรายงานตาม ID

### PUT `/api/reports/{id}`
อัปเดตรายงาน

### DELETE `/api/reports/{id}`
ลบรายงาน

### POST `/api/interview/start`
เริ่มการสัมภาษณ์ใหม่

### PUT `/api/interview/answer`
บันทึกคำตอบในการสัมภาษณ์

## 🎯 ฟีเจอร์หลัก

### ✅ สำหรับผู้ใช้
- สัมภาษณ์อัตโนมัติด้วยภาษามือ
- สอนท่ามือ "ใช่"/"ไม่ใช่" แบบ interactive
- สรุปข้อมูลแบบ real-time
- ติดต่อฉุกเฉิน (191, 1414)
- รองรับทุกขนาดหน้าจอ (Responsive)

### ✅ สำหรับแอดมิน
- จัดการรายงานผ่าน API
- ตรวจสอบสถิติ
- Audit trail สำหรับการเปลี่ยนแปลง
- Export ข้อมูลได้

### ✅ สำหรับนักพัฒนา
- RESTful API มาตรฐาน
- MVC Architecture
- Error handling ครบถ้วน
- Documentation ครบ

## 🔧 การตั้งค่าเพิ่มเติม

### Environment Variables
สร้างไฟล์ `.env`:
```env
DB_HOST=localhost
DB_NAME=police_care_interview
DB_USER=root
DB_PASS=your_password
API_BASE_URL=https://your-domain.com/api
```

### Security Headers
เพิ่มใน `api/index.php`:
```php
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
```

### Rate Limiting
ใช้ Redis หรือฐานข้อมูลสำหรับ rate limiting:
```php
// ตัวอย่าง rate limiting
$rate_limit_key = 'rate_limit_' . $_SERVER['REMOTE_ADDR'];
$requests = $redis->get($rate_limit_key);
if ($requests > 100) {
    http_response_code(429);
    die('Too many requests');
}
```

## 📊 ฐานข้อมูล

### ตารางหลัก
- `reports` - ข้อมูลรายงาน
- `report_answers` - คำตอบในรายงาน
- `scenarios` - ข้อมูลสถานการณ์
- `questions` - ข้อมูลคำถาม
- `audit_log` - บันทึกการเปลี่ยนแปลง

### View สำหรับรายงาน
- `report_summary` - สรุปข้อมูลรายงาน

### Stored Procedure
- `GetDailyStats()` - ดึงสถิติรายวัน

## 🚨 การจัดการข้อผิดพลาด

### Frontend Error Handling
- Global error catching
- User-friendly error messages
- Toast notifications
- Fallback UI

### Backend Error Handling
- Try-catch blocks
- Database transactions
- Audit logging
- Standardized error responses

## 🔒 ความปลอดภัย

### Authentication
- JWT tokens (สำหรับ admin panel)
- API keys (สำหรับ external systems)
- Session management

### Data Protection
- Input validation
- SQL injection prevention
- XSS protection
- CSRF tokens

### Privacy
- IP address logging
- User agent tracking
- Data encryption (sensitive data)

## 📱 การใช้งาน

### 1. เปิดระบบ
เข้าถึง `https://your-domain.com/public/`

### 2. เริ่มสัมภาษณ์
- เลือกประเภทเหตุการณ์
- ตอบคำถามด้วยท่ามือหรือปุ่ม
- รับคำแนะนำท่ามือถ้าไม่เข้าใจ

### 3. ส่งรายงาน
- ตรวจสอบข้อมูลสรุป
- กดส่งรายงาน
- รับการแจ้งเมื่อสำเร็จ

## 🎥 การเพิ่มวิดีโอ

### 1. อัปโหลดวิดีโอ
```bash
mkdir -p public/videos/theft
mkdir -p public/videos/accident
# ... สำหรับแต่ละ scenario
```

### 2. อัปเดตฐานข้อมูล
```sql
UPDATE questions 
SET video_url = '/videos/theft/saw_suspect.mp4' 
WHERE scenario_key = 'theft' AND question_number = 1;
```

## 📈 การตรวจสอบสถิติ

### API Call
```bash
curl -X GET "https://your-domain.com/api/reports?status=submitted&page=1&limit=10"
```

### Database Query
```sql
CALL GetDailyStats();
SELECT * FROM report_summary WHERE status = 'submitted';
```

## 🔄 การอัปเดตระบบ

### 1. Backup ข้อมูล
```bash
mysqldump -u root -p police_care_interview > backup.sql
```

### 2. อัปเดตไฟล์
```bash
git pull origin main
```

### 3. อัปเดตฐานข้อมูล
```bash
mysql -u root -p police_care_interview < updates.sql
```

## 🐛 การแก้ไขปัญหา

### Common Issues
1. **Database Connection**: ตรวจสอบ credentials ใน `config/database.php`
2. **API 404**: ตรวจสอบ URL rewriting ใน web server
3. **CORS Issues**: ตรวจสอบ headers ใน `api/index.php`
4. **Permission Issues**: ตรวจสอบสิทธิ์การเข้าถึงไฟล์

### Debug Mode
เปิด debug mode ใน `api/index.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📞 การติดต่อ

- **Developer**: Police Care Development Team
- **Email**: dev@policecare.go.th
- **Support**: support@policecare.go.th

## 📄 License

© 2024 Royal Thai Police - Police Care Interview System
All Rights Reserved

---

**ระบบพร้อมให้บริการแล้ว! 🚔✋️**
