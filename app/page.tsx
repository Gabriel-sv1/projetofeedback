export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Sistema de Feedback
          </h1>
          <h2 className="text-xl text-slate-600 mb-6">
            Venturini&Co
          </h2>
          <p className="text-slate-500 mb-8">
            Sistema carregado com sucesso! 🎉
          </p>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✅ Aplicação funcionando</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">🚀 Pronto para desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}