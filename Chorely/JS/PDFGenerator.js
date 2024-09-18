export class PDFGenerator {
    constructor(todoList) {
        this.todoList = todoList;
    }

    saveTasksToPDF() {
        const { jsPDF } = window.jspdf;

        const canvas = document.createElement('canvas');
        const pdfWidth = 210;  
        const pdfHeight = 297; 
        const scale = 10;      
        canvas.width = pdfWidth * scale;
        canvas.height = pdfHeight * scale;
        const ctx = canvas.getContext('2d');

        this._drawBackground(ctx, canvas);
        this._drawLogo(ctx, canvas, scale);
        this._drawIcon(ctx, canvas, scale);
        this._drawText(ctx, canvas, scale);

        const doc = new jsPDF();

        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        this._addTasksToDocument(doc);

        doc.save('tasks.pdf');
    }

    _drawBackground(ctx, canvas) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 4);  
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    _drawLogo(ctx, canvas, scale) {
        const logoWidth = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) * 0.7;
        const logoHeight = 180 * scale * 0.7;
        const startX = (canvas.width - logoWidth) / 2;
        const startY = (canvas.height - logoHeight) / 2;

        const logoGradient = ctx.createLinearGradient(startX, startY, startX + logoWidth, startY + logoHeight);
        logoGradient.addColorStop(0, 'rgba(135, 206, 250, 0.2)');  
        logoGradient.addColorStop(1, 'rgba(70, 130, 180, 0.3)');   
        ctx.fillStyle = logoGradient;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY + 30 * scale);
        ctx.lineTo(startX, startY + logoHeight - 30 * scale);
        ctx.quadraticCurveTo(startX, startY + logoHeight, startX + 30 * scale, startY + logoHeight);
        ctx.lineTo(startX + logoWidth - 30 * scale, startY + logoHeight);
        ctx.quadraticCurveTo(startX + logoWidth, startY + logoHeight, startX + logoWidth, startY + logoHeight - 30 * scale);
        ctx.lineTo(startX + logoWidth, startY + 30 * scale);
        ctx.quadraticCurveTo(startX + logoWidth, startY, startX + logoWidth - 30 * scale, startY);
        ctx.lineTo(startX + 30 * scale, startY);
        ctx.quadraticCurveTo(startX, startY, startX, startY + 30 * scale);
        ctx.fill();
    }

    _drawIcon(ctx, canvas, scale) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const iconSize = 80 * scale * 0.7;
        const iconOffsetX = iconSize * 0.9; 
        const iconGradient = ctx.createRadialGradient(
            centerX - iconOffsetX, centerY, 0,
            centerX - iconOffsetX, centerY, iconSize / 2
        );
        iconGradient.addColorStop(0, 'rgba(30, 144, 255, 0.8)'); 
        iconGradient.addColorStop(1, 'rgba(0, 191, 255, 0.6)');   
        
        ctx.beginPath();
        ctx.arc(centerX - iconOffsetX, centerY, iconSize / 2, 0, 2 * Math.PI);
        ctx.fillStyle = iconGradient;
        ctx.fill();

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10 * scale * 0.7;
        ctx.shadowOffsetX = 3 * scale * 0.7;
        ctx.shadowOffsetY = 3 * scale * 0.7;

        ctx.font = `bold ${40 * scale * 0.7}px "Font Awesome 5 Free"`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\uf00c', centerX - iconOffsetX, centerY);
    }

    _drawText(ctx, canvas, scale) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const iconSize = 80 * scale * 0.7;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 5 * scale * 0.7;
        ctx.shadowOffsetX = 2 * scale * 0.7;
        ctx.shadowOffsetY = 2 * scale * 0.7;

        const textOffsetX = iconSize * 0.7; 
        ctx.font = `bold ${32 * scale * 0.7}px Arial`;
        
        const textGradient = ctx.createLinearGradient(
            centerX + textOffsetX - 50 * scale * 0.7, centerY,
            centerX + textOffsetX + 50 * scale * 0.7, centerY
        );
        textGradient.addColorStop(0, 'rgba(25, 25, 112, 0.9)');
        textGradient.addColorStop(1, 'rgba(70, 130, 180, 0.9)'); 
        
        ctx.fillStyle = textGradient;
        ctx.fillText('CHORELY', centerX + textOffsetX, centerY);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1 * scale * 0.7;
        ctx.strokeText('CHORELY', centerX + textOffsetX, centerY);

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    _addTasksToDocument(doc) {
        const tasks = this.todoList.getAllTasks().map(task => ({
            text: task.text,
            completed: task.completed
        }));

        doc.setFontSize(12);

        doc.autoTable({
            head: [['Zadania/Tasks:']],
            body: tasks.map(task => [
                {
                    content: task.text,
                    styles: {
                        textDecoration: task.completed ? 'line-through' : 'none',
                        textColor: task.completed ? [255, 0, 0] : [0, 0, 0]
                    }
                }
            ]),
            startY: 20,
            margin: { left: 10, right: 10 },
            styles: { overflow: 'linebreak' },
            theme: 'grid',
            headStyles: { fillColor: [30, 144, 255], textColor: 255 },  
            alternateRowStyles: { fillColor: [240, 248, 255] },  
            didDrawCell: function(data) {
                if (data.section === 'body' && tasks[data.row.index].completed) {
                    const { x, y, width, height } = data.cell;
                    doc.setDrawColor(255, 0, 0);  
                    doc.line(x, y + height / 2, x + width, y + height / 2);
                }
            }
        });
    }
}