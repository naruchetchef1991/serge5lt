import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function App() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [visibleRows, setVisibleRows] = useState(30);

  useEffect(() => {
    fetch(
        'https://opensheet.elk.sh/1zHDxblHaHrcCrmTteVhij-3yfrl7bM9kYk-8dGiJuxE/%E0%B8%A1%E0%B8%B4%E0%B8%96%E0%B8%B8%E0%B8%99%E0%B8%B2%E0%B8%A2%E0%B8%99%202568'
    )
      .then((res) => res.json())
      .then((fetchedData) => {
        setData(fetchedData);

        const counts = fetchedData.reduce((acc, row) => {
          const key = row['การวินิจฉัย']?.trim() || '-';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        setSummary(counts);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setVisibleRows(30); // reset when searchTerm or selectedPeriod changes
  }, [searchTerm, selectedPeriod]);

  const orderBySummary = Object.entries(summary)
    .filter(([diagnosis]) => diagnosis !== '-')
    .filter(([diagnosis]) =>
      diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b[1] - a[1]);

  // Generate last 24 months (including this month) in Buddhist calendar
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const now = new Date();
  const periodOptions = [];
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() + 543;
    periodOptions.push(`${month} ${year}`);
  }

  return (
    <div className="app-bg min-vh-100 py-3 py-md-4">
      <div className="container-fluid px-2 px-md-4">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow-lg rounded-4 border-0">
              <div className="card-header bg-primary text-white rounded-top-4 mb-3">
                <h2 className="card-title text-center mb-0" style={{ letterSpacing: '1px', fontSize: '1.2rem' }}>
                  สรุปจำนวนตามการวินิจฉัย
                </h2>
              </div>
              <div className="card-body p-3 p-md-4">
                {/* Search Input */}
                {data.length > 0 && (
                  <>
                    <div className="mb-3 mb-md-4">
                      <input
                        type="text"
                        placeholder="ค้นหา"
                        className="form-control form-control-lg shadow-sm rounded-pill px-3 px-md-4 w-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {/* Dropdown for period selection */}
                    <div className="mb-3 mb-md-4">
                      <select
                        className="form-select form-select-lg shadow-sm rounded-pill px-3 px-md-4 w-100"
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                      >
                        <option value="">เลือกเดือนที่ต้องการ</option>
                        {periodOptions.map((period, idx) => (
                          <option key={idx} value={period}>{period}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                {/* show loading   */}
                {data.length === 0 && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                {/* Pie Chart Top 5 */}
                <div className="mb-4">
                  <Pie
                    data={{
                      labels: orderBySummary.slice(0, 5).map(([diagnosis]) => diagnosis),
                      datasets: [
                        {
                          label: 'จำนวน',
                          data: orderBySummary.slice(0, 5).map(([, count]) => count),
                          backgroundColor: [
                            '#2563eb', '#60a5fa', '#fbbf24', '#f87171', '#34d399'
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' },
                        title: { display: true, text: '5 อันดับสูงสุด' },
                      },
                    }}
                  />
                </div>
                {/* Table */}
                <div className="table-responsive px-0">
                  <table className="table table-bordered table-hover table-sm text-center align-middle bg-white mb-0 w-100">
                    <thead className="table-primary">
                      <tr>
                        <th>ลำดับ</th>
                        <th>การวินิจฉัย</th>
                        <th className="text-nowrap">จำนวน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderBySummary.slice(0, visibleRows).map(([diagnosis, count], index) => (
                        <tr key={index}>
                          <td className="small">{index + 1}</td>
                          <td className="text-start small">{diagnosis}</td>
                          <td className="fw-bold small">{count}</td>
                        </tr>
                      ))}
                      {orderBySummary.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-muted py-3">
                            ไม่พบรายการที่ตรงกับคำค้นหา
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {/* Load More Button */}
                  {visibleRows < orderBySummary.length && (
                    <div className="text-center my-3">
                      <button
                        className="btn btn-outline-primary rounded-pill px-4"
                        onClick={() => setVisibleRows(v => v + 30)}
                      >
                        แสดงเพิ่มเติม
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-center text-muted mt-3 mb-0 small">
                  รวมทั้งหมด <span className="fw-bold text-primary">{orderBySummary.length}</span> รายการ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
