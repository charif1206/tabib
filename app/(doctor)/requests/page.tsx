export default function RequestsPage() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">الطلبات الجديدة</h2>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
              <div>
                <h4 className="font-bold text-gray-900">مريض رقـم {i}</h4>
                <p className="text-sm text-gray-500">طلب موعد يوم غد الساعة 10:00 صباحاً</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100">قبول</button>
              <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100">رفض</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
