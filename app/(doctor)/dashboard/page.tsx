export default function DoctorDashboard() {
  const stats = [
    { title: "المواعيد اليوم", value: "8" },
    { title: "طلبات جديدة", value: "3" },
    { title: "المرضى", value: "145" },
    { title: "التقييم العام", value: "4.8" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex-1 min-h-[400px]">
         <h2 className="text-lg font-bold text-gray-800 mb-4">مواعيد اليوم</h2>
         <div className="text-center py-20 text-gray-500">
           لا يوجد مواعيد قادمة اليوم.
         </div>
      </div>
    </div>
  );
}
