'use client';

// ============================================
// ダッシュボード - メインハブ
// ロールに応じた表示切り替えとナビゲーション
// ============================================

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';
import MemberList from './MemberList';
import MemberDetail from './MemberDetail';
import AssessmentForm from './AssessmentForm';
import ResultSummary from './ResultSummary';
import AdminPanel from './AdminPanel';

// 画面タイプ
export type ViewType =
  | 'member-list'
  | 'member-detail'
  | 'assessment'
  | 'result'
  | 'admin';

// ナビゲーション状態
export interface NavigationState {
  view: ViewType;
  memberId?: string;
  assessmentId?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [navState, setNavState] = useState<NavigationState>({
    view: user?.role === 'admin' ? 'admin' : 'member-list',
  });

  // 画面遷移関数
  const navigate = (newState: NavigationState) => {
    setNavState(newState);
  };

  // アクティブ画面のレンダリング
  const renderView = () => {
    switch (navState.view) {
      case 'member-list':
        return (
          <MemberList
            onSelectMember={(memberId) =>
              navigate({ view: 'member-detail', memberId })
            }
          />
        );
      case 'member-detail':
        return (
          <MemberDetail
            memberId={navState.memberId!}
            onStartAssessment={(memberId) =>
              navigate({ view: 'assessment', memberId })
            }
            onViewResult={(memberId, assessmentId) =>
              navigate({ view: 'result', memberId, assessmentId })
            }
            onBack={() => navigate({ view: 'member-list' })}
          />
        );
      case 'assessment':
        return (
          <AssessmentForm
            memberId={navState.memberId!}
            onComplete={(assessmentId) =>
              navigate({
                view: 'result',
                memberId: navState.memberId,
                assessmentId,
              })
            }
            onCancel={() =>
              navigate({
                view: 'member-detail',
                memberId: navState.memberId,
              })
            }
          />
        );
      case 'result':
        return (
          <ResultSummary
            memberId={navState.memberId!}
            assessmentId={navState.assessmentId!}
            onBack={() =>
              navigate({
                view: 'member-detail',
                memberId: navState.memberId,
              })
            }
          />
        );
      case 'admin':
        return <AdminPanel />;
      default:
        return <MemberList onSelectMember={(id) => navigate({ view: 'member-detail', memberId: id })} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ナビゲーション */}
      <Navigation
        currentView={navState.view}
        onNavigate={(view) => navigate({ view })}
      />

      {/* メインコンテンツ */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-6 pb-20 lg:pb-6">
        <div className="max-w-6xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
