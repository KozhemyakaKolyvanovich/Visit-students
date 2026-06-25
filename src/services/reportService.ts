// src/services/reportService.ts
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, AlignmentType } from 'docx';

interface ReportData {
  title: string;
  studentName: string;
  disciplineName: string;
  period: string;
  dates: string[];
  statuses: string[];
  comments: string[];
  stats: {
    present: number;
    absent: number;
    sick: number;
    late: number;
    total: number;
  };
}

interface GroupReportData {
  title: string;
  disciplineName: string;
  period: string;
  students: {
    name: string;
    statuses: string[];
    comments: string[];
  }[];
  dates: string[];
}

// ===== ФУНКЦИЯ ДЛЯ ОДНОГО СТУДЕНТА =====
export const generateReport = async (data: ReportData): Promise<void> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: data.title,
              size: 32,
              bold: true,
              color: "1E3A8A",
              font: "Arial",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Дисциплина: ${data.disciplineName}`,
              size: 24,
              font: "Arial",
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Студент: ${data.studentName}`,
              size: 24,
              font: "Arial",
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Период: ${data.period}`,
              size: 24,
              font: "Arial",
            }),
          ],
          spacing: { after: 200 },
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Дата",
                          bold: true,
                          size: 22,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "E8F0FE" },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Статус",
                          bold: true,
                          size: 22,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "E8F0FE" },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Комментарий",
                          bold: true,
                          size: 22,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "E8F0FE" },
                }),
              ],
            }),
            ...data.dates.map((date, index) => {
              const status = data.statuses[index] || '—';
              const comment = data.comments[index] || '—';
              
              let statusColor = "000000";
              let statusLabel = status;
              if (status === 'P') { statusColor = "27AE60"; statusLabel = "Присутствует"; }
              else if (status === 'N') { statusColor = "E74C3C"; statusLabel = "Неявка"; }
              else if (status === 'Б') { statusColor = "F39C12"; statusLabel = "Болезнь"; }
              else if (status === 'Оп') { statusColor = "3498DB"; statusLabel = "Опоздал"; }
              else { statusLabel = "—"; }

              return new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: date,
                            size: 20,
                            font: "Arial",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: statusLabel,
                            size: 20,
                            font: "Arial",
                            color: statusColor,
                            bold: status !== '—',
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: comment,
                            size: 20,
                            font: "Arial",
                          }),
                        ],
                        alignment: AlignmentType.LEFT,
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  }),
                ],
              });
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Итого:",
                          bold: true,
                          size: 22,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "F0F4F8" },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `✅ ${data.stats.present}  ❌ ${data.stats.absent}  🩺 ${data.stats.sick}  ⏰ ${data.stats.late}`,
                          size: 20,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "F0F4F8" },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `Всего записей: ${data.stats.total}`,
                          size: 20,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "F0F4F8" },
                }),
              ],
            }),
          ],
          width: {
            size: 100,
            type: 'pct',
          },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Отчёт_${data.studentName}_${data.disciplineName}_${data.period}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// ===== ФУНКЦИЯ ДЛЯ ГРУППЫ =====
export const generateGroupReport = async (data: GroupReportData): Promise<void> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: data.title,
              size: 32,
              bold: true,
              color: "1E3A8A",
              font: "Arial",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Дисциплина: ${data.disciplineName}`,
              size: 24,
              font: "Arial",
            }),
          ],
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Период: ${data.period}`,
              size: 24,
              font: "Arial",
            }),
          ],
          spacing: { after: 200 },
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Студент",
                          bold: true,
                          size: 22,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "E8F0FE" },
                }),
                ...data.dates.map((date) => new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: date,
                          bold: true,
                          size: 18,
                          font: "Arial",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                  shading: { fill: "E8F0FE" },
                })),
              ],
            }),
            ...data.students.map((student) => new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: student.name,
                          size: 20,
                          font: "Arial",
                        }),
                      ],
                    }),
                  ],
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 1 },
                    bottom: { style: BorderStyle.SINGLE, size: 1 },
                    left: { style: BorderStyle.SINGLE, size: 1 },
                    right: { style: BorderStyle.SINGLE, size: 1 },
                  },
                }),
                ...student.statuses.map((status, index) => {
                  let statusColor = "000000";
                  let statusLabel = status;
                  if (status === 'P') { statusColor = "27AE60"; statusLabel = "П"; }
                  else if (status === 'N') { statusColor = "E74C3C"; statusLabel = "Н"; }
                  else if (status === 'Б') { statusColor = "F39C12"; statusLabel = "Б"; }
                  else if (status === 'Оп') { statusColor = "3498DB"; statusLabel = "Оп"; }
                  else { statusLabel = "—"; }

                  const comment = student.comments[index] || '';

                  return new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: statusLabel,
                            size: 20,
                            font: "Arial",
                            color: statusColor,
                            bold: status !== '—',
                          }),
                          ...(comment ? [
                            new TextRun({
                              text: ` (${comment})`,
                              size: 16,
                              font: "Arial",
                              color: "666666",
                            }),
                          ] : []),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                  });
                }),
              ],
            })),
          ],
          width: {
            size: 100,
            type: 'pct',
          },
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Отчёт_группа_${data.disciplineName}_${data.period}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};