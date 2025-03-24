export function TokenCard({ token, index }) {
    const colorScheme = index === 0 
      ? { header: 'bg-teal-600', reserve: 'bg-teal-50', text: 'text-teal-700', value: 'text-teal-800' }
      : { header: 'bg-indigo-600', reserve: 'bg-indigo-50', text: 'text-indigo-700', value: 'text-indigo-800' };
  
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
        <div className={`${colorScheme.header} px-4 py-3`}>
          <h3 className="text-lg font-medium text-white">
            Token {index}: {token.symbol}
          </h3>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500 text-sm mb-1">Name</p>
              <p className="font-medium">{token.name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm mb-1">Symbol</p>
              <p className="font-medium">{token.symbol}</p>
            </div>
          </div>
          
          <div>
            <p className="text-slate-500 text-sm mb-1">Decimals</p>
            <p className="font-medium">{token.decimals}</p>
          </div>
          
          <div>
            <p className="text-slate-500 text-sm mb-1">Address</p>
            <p className="font-mono text-sm break-all bg-slate-50 p-2 rounded-md">
              {token.address}
            </p>
          </div>
          
          <div className={`${colorScheme.reserve} p-4 rounded-md`}>
            <p className={`${colorScheme.text} text-sm mb-1`}>Reserve</p>
            <p className={`text-xl font-semibold ${colorScheme.value}`}>{token.reserve}</p>
          </div>
        </div>
      </div>
    );
  }