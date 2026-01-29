
import React from 'react';

interface SectionLoaderProps {
  isLoading: boolean;
  onLoad: () => void;
}

const SectionLoader: React.FC<SectionLoaderProps> = ({ isLoading, onLoad }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">분석하여 콘텐츠를 생성 중입니다...</p>
        </div>
      ) : (
        <div className="text-center px-6">
          <p className="text-gray-400 mb-4">상세한 분석과 즐길거리가 준비되어 있습니다.</p>
          <button 
            onClick={onLoad}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            지금 생성하기
          </button>
        </div>
      )}
    </div>
  );
};

export default SectionLoader;
