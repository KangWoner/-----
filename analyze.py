#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV 성적표 분석 및 시각화 도구
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import argparse
import sys
from pathlib import Path

# 한글 폰트 설정 (matplotlib)
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False


def load_csv(file_path):
    """CSV 파일을 읽어들입니다."""
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
        print(f"✓ 파일 로드 완료: {file_path}")
        print(f"✓ 총 {len(df)}명의 학생 데이터")
        return df
    except FileNotFoundError:
        print(f"✗ 파일을 찾을 수 없습니다: {file_path}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ 파일 로드 중 오류 발생: {e}")
        sys.exit(1)


def analyze_statistics(df):
    """성적 통계를 분석합니다."""
    print("\n" + "="*60)
    print("📊 성적 통계 요약")
    print("="*60)

    # 숫자형 컬럼만 선택
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    if not numeric_cols:
        print("✗ 분석할 수 있는 숫자형 데이터가 없습니다.")
        return

    for col in numeric_cols:
        print(f"\n[{col}]")
        print(f"  평균: {df[col].mean():.2f}")
        print(f"  중앙값: {df[col].median():.2f}")
        print(f"  최고점: {df[col].max():.2f}")
        print(f"  최저점: {df[col].min():.2f}")
        print(f"  표준편차: {df[col].std():.2f}")

    # 전체 통계 테이블
    print("\n" + "-"*60)
    print("상세 통계 정보:")
    print("-"*60)
    print(df[numeric_cols].describe())

    return numeric_cols


def calculate_total_and_rank(df, score_columns):
    """총점과 등수를 계산합니다."""
    if len(score_columns) > 1:
        df['총점'] = df[score_columns].sum(axis=1)
        df['등수'] = df['총점'].rank(ascending=False, method='min').astype(int)

        print("\n" + "="*60)
        print("🏆 총점 및 등수")
        print("="*60)

        # 이름 컬럼 찾기
        name_col = None
        for col in df.columns:
            if '이름' in col or 'name' in col.lower():
                name_col = col
                break

        if name_col:
            ranking_df = df[[name_col, '총점', '등수'] + score_columns].sort_values('등수')
            print(ranking_df.to_string(index=False))
        else:
            ranking_df = df[['총점', '등수'] + score_columns].sort_values('등수')
            print(ranking_df)

        return True
    return False


def create_visualizations(df, numeric_cols, output_dir='output'):
    """다양한 시각화 차트를 생성합니다."""
    Path(output_dir).mkdir(exist_ok=True)

    print("\n" + "="*60)
    print("📈 시각화 생성 중...")
    print("="*60)

    # 1. 과목별 점수 분포 (히스토그램)
    if numeric_cols:
        fig, axes = plt.subplots(len(numeric_cols), 1, figsize=(10, 4*len(numeric_cols)))
        if len(numeric_cols) == 1:
            axes = [axes]

        for idx, col in enumerate(numeric_cols):
            axes[idx].hist(df[col], bins=10, edgecolor='black', alpha=0.7, color='skyblue')
            axes[idx].set_xlabel('Score')
            axes[idx].set_ylabel('Frequency')
            axes[idx].set_title(f'{col} - Distribution')
            axes[idx].grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(f'{output_dir}/distribution.png', dpi=300, bbox_inches='tight')
        print(f"✓ 저장: {output_dir}/distribution.png")
        plt.close()

    # 2. 박스 플롯 (과목별 비교)
    if len(numeric_cols) > 1:
        plt.figure(figsize=(12, 6))
        df[numeric_cols].boxplot()
        plt.ylabel('Score')
        plt.title('Score Distribution by Subject')
        plt.xticks(rotation=45, ha='right')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(f'{output_dir}/boxplot.png', dpi=300, bbox_inches='tight')
        print(f"✓ 저장: {output_dir}/boxplot.png")
        plt.close()

    # 3. 히트맵 (상관관계)
    if len(numeric_cols) > 1:
        plt.figure(figsize=(10, 8))
        correlation = df[numeric_cols].corr()
        sns.heatmap(correlation, annot=True, cmap='coolwarm', center=0,
                    square=True, linewidths=1, fmt='.2f')
        plt.title('Correlation Heatmap')
        plt.tight_layout()
        plt.savefig(f'{output_dir}/correlation.png', dpi=300, bbox_inches='tight')
        print(f"✓ 저장: {output_dir}/correlation.png")
        plt.close()

    # 4. 총점이 있으면 총점 순위 차트
    if '총점' in df.columns:
        plt.figure(figsize=(12, 6))
        sorted_df = df.sort_values('총점', ascending=True)

        # 이름 컬럼 찾기
        name_col = None
        for col in df.columns:
            if '이름' in col or 'name' in col.lower():
                name_col = col
                break

        if name_col:
            labels = sorted_df[name_col].astype(str)
        else:
            labels = [f'Student {i+1}' for i in range(len(sorted_df))]

        bars = plt.barh(range(len(sorted_df)), sorted_df['총점'], color='steelblue')
        plt.yticks(range(len(sorted_df)), labels)
        plt.xlabel('Total Score')
        plt.title('Total Score Ranking')
        plt.grid(True, alpha=0.3, axis='x')

        # 점수 표시
        for i, (idx, row) in enumerate(sorted_df.iterrows()):
            plt.text(row['총점'], i, f" {row['총점']:.0f}",
                    va='center', fontsize=9)

        plt.tight_layout()
        plt.savefig(f'{output_dir}/ranking.png', dpi=300, bbox_inches='tight')
        print(f"✓ 저장: {output_dir}/ranking.png")
        plt.close()

    print(f"\n✓ 모든 시각화가 '{output_dir}/' 폴더에 저장되었습니다.")


def export_summary(df, numeric_cols, output_dir='output'):
    """분석 결과를 텍스트 파일로 저장합니다."""
    Path(output_dir).mkdir(exist_ok=True)

    output_file = f'{output_dir}/summary.txt'

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("="*60 + "\n")
        f.write("성적표 분석 결과 요약\n")
        f.write("="*60 + "\n\n")

        f.write(f"총 학생 수: {len(df)}명\n\n")

        for col in numeric_cols:
            f.write(f"[{col}]\n")
            f.write(f"  평균: {df[col].mean():.2f}\n")
            f.write(f"  중앙값: {df[col].median():.2f}\n")
            f.write(f"  최고점: {df[col].max():.2f}\n")
            f.write(f"  최저점: {df[col].min():.2f}\n")
            f.write(f"  표준편차: {df[col].std():.2f}\n\n")

        f.write("\n" + "="*60 + "\n")
        f.write("상세 통계\n")
        f.write("="*60 + "\n")
        f.write(df[numeric_cols].describe().to_string())

        if '총점' in df.columns and '등수' in df.columns:
            f.write("\n\n" + "="*60 + "\n")
            f.write("총점 순위\n")
            f.write("="*60 + "\n")

            name_col = None
            for col in df.columns:
                if '이름' in col or 'name' in col.lower():
                    name_col = col
                    break

            if name_col:
                ranking_df = df[[name_col, '총점', '등수']].sort_values('등수')
            else:
                ranking_df = df[['총점', '등수']].sort_values('등수')

            f.write(ranking_df.to_string(index=False))

    print(f"✓ 분석 요약 저장: {output_file}")


def main():
    parser = argparse.ArgumentParser(description='CSV 성적표 분석 및 시각화 도구')
    parser.add_argument('csv_file', help='분석할 CSV 파일 경로')
    parser.add_argument('-o', '--output', default='output',
                        help='출력 디렉토리 (기본값: output)')
    parser.add_argument('--no-viz', action='store_true',
                        help='시각화 생성 안 함')

    args = parser.parse_args()

    print("\n" + "="*60)
    print("📚 CSV 성적표 분석 도구")
    print("="*60)

    # CSV 파일 로드
    df = load_csv(args.csv_file)

    # 통계 분석
    numeric_cols = analyze_statistics(df)

    if numeric_cols:
        # 총점 및 등수 계산
        calculate_total_and_rank(df, numeric_cols)

        # 시각화 생성
        if not args.no_viz:
            create_visualizations(df, numeric_cols, args.output)

        # 결과 요약 저장
        export_summary(df, numeric_cols, args.output)

    print("\n" + "="*60)
    print("✓ 분석 완료!")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
