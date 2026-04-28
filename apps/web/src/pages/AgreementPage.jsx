import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthProvider.jsx'
import { db } from '../lib/firebase.js';
// jsPDF will be imported dynamically in generatePDF function
// pdf-lib will be imported dynamically in merge function
import {
  Box, Button, Card, CardContent, Container,
  Grid, Stack, Typography, TextField,
  Divider, Alert, CircularProgress, Chip,
  MenuItem, Paper, IconButton
} from '@mui/material'
import {
  Download, Preview, Home as HomeIcon,
  Person, AttachMoney, CalendarToday,
  Description, Gavel, Upload, CloudUpload
} from '@mui/icons-material'

export function AgreementPage() {
  const { rentalId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [rental, setRental] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // E-stamp upload and merge states
  const [generatedAgreementBlob, setGeneratedAgreementBlob] = useState(null)
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState(null)
  const [eStampFile, setEStampFile] = useState(null)
  const [merging, setMerging] = useState(false)
  const [mergeError, setMergeError] = useState("")

  // Agreement form fields
  const [formData, setFormData] = useState({
    // Landlord details
    landlordName: "",
    landlordFatherName: "",
    landlordAddress: "",
    landlordAadhaar: "",
    landlordPAN: "",
    
    // Tenant details
    tenantName: "",
    tenantFatherName: "",
    tenantPermanentAddress: "",
    tenantAadhaar: "",
    
    // Property details
    propertyAddress: "",
    propertyCity: "",
    propertyType: "1BHK",
    furnished: "Semi-Furnished",
    parkingIncluded: "No",
    floor: "",
    
    // Financial details
    monthlyRent: "",
    securityDeposit: "",
    startDate: "",
    duration: "11",
    
    // Terms and conditions
    lockInPeriod: "11",
    noticePeriod: "1",
    petsAllowed: "No",
    smokingAllowed: "No",
    sublettingAllowed: "No",
    waterBill: "Included in rent",
    gasBill: "Tenant",
    maintenanceCharges: "Tenant",
    additionalTerms: ""
  })

  // Load rental data
  useEffect(() => {
    const fetchRental = async () => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        // Try to fetch rental by ID first
        const rentalDoc = await firebase
          .firestore()
          .doc('rentals/' + rentalId)
          .get()

        if (rentalDoc.exists) {
          const rentalData = rentalDoc.data()
          setRental(rentalData)

          // Pre-fill form with rental data and saved user profile
          const userDoc = await firebase
            .firestore()
            .doc('users/' + user.uid)
            .get()

          if (userDoc.exists) {
            const userData = userDoc.data()
            
            // Pre-fill form with rental data and saved user profile
            setFormData({
              ...rentalData,
              // From saved user profile
              landlordAddress: 
                userData.address || 
                userData.permanentAddress || "",
              startDate: rentalData.startDate || "",
              
              // Default values for missing fields
              monthlyRent: 
                rentalData.monthlyRent 
                ?.toString() || "",
              securityDeposit: 
                rentalData.securityDeposit 
                ?.toString() || "",
              duration: 
                rentalData.duration 
                ?.toString() || "11",
              lockInPeriod: 
                rentalData.lockInPeriod 
                ?.toString() || "11",
              noticePeriod: 
                rentalData.noticePeriod 
                ?.toString() || "1",
              petsAllowed: 
                rentalData.petsAllowed || "No",
              smokingAllowed: 
                rentalData.smokingAllowed || "No",
              sublettingAllowed: 
                rentalData.sublettingAllowed || "No",
              waterBill: 
                rentalData.waterBill || "Included in rent",
              gasBill: 
                rentalData.gasBill || "Tenant",
              maintenanceCharges: 
                rentalData.maintenanceCharges || "Tenant",
              additionalTerms: 
                rentalData.additionalTerms || ""
            })
          }
        }
      } catch (error) {
        console.error('Error fetching rental:', error)
        setError('Failed to load rental details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRental()
  }, [rentalId, user, navigate])

  // Handle form input changes
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  // Generate PDF function
  const generatePDF = async () => {
    setGenerating(true)
    setError("")

    try {
      if (!formData.landlordName ||
          !formData.tenantName ||
          !formData.propertyAddress ||
          !formData.monthlyRent ||
          !formData.securityDeposit ||
          !formData.startDate) {
        setError(
          "Please fill all required fields")
        setGenerating(false)
        return
      }

      const JsPDFClass = window.jspdf?.jsPDF
      if (!JsPDFClass) {
        setError(
          "PDF library not ready. " +
          "Please refresh and try again.")
        setGenerating(false)
        return
      }

      const doc = new JsPDFClass('p','mm','a4')
      const pw = doc.internal.pageSize.width
      const ph = doc.internal.pageSize.height
      const ml = 25  // left margin
      const mr = 25  // right margin
      const mw = pw - ml - mr
      let y = 20
      let pageNum = 1
      let totalPages = 1

      // Calculate dates
      const startObj = new Date(
        formData.startDate + '-01')
      const endObj = new Date(startObj)
      endObj.setMonth(endObj.getMonth() + 
        parseInt(formData.duration || 11))
      
      const months = [
        'January','February','March',
        'April','May','June','July',
        'August','September','October',
        'November','December'
      ]
      
      const fmtDate = (d) => 
        d.getDate() + ' ' + 
        months[d.getMonth()] + ' ' + 
        d.getFullYear()

      const startFmt = fmtDate(startObj)
      const endFmt = fmtDate(endObj)

      // Helpers
      const addFooter = () => {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(
          'Page ' + pageNum + ' of 2',
          pw / 2, ph - 10,
          { align: 'center' })
        doc.setTextColor(0, 0, 0)
      }

      const checkNewPage = (needed = 15) => {
        if (y + needed > ph - 20) {
          addFooter()
          doc.addPage()
          pageNum++
          y = 20
        }
      }

      // Write paragraph with word wrap
      const writePara = (text, 
        size = 10.5, 
        bold = false,
        indent = 0,
        justify = true) => {
        
        doc.setFontSize(size)
        doc.setFont('helvetica',
          bold ? 'bold' : 'normal')
        doc.setTextColor(0, 0, 0)
        
        const safeText = String(text || '')
        const lineWidth = mw - indent
        // Calculate chars per line based 
        // on font size
        const avgCharWidth = size * 0.21
        const charsPerLine = Math.floor(
          lineWidth / avgCharWidth)
        
        const words = safeText.split(' ')
        const lines = []
        let currentLine = ''
        
        words.forEach(word => {
          const testLine = currentLine 
            ? currentLine + ' ' + word 
            : word
          if (testLine.length > charsPerLine
              && currentLine !== '') {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine = testLine
          }
        })
        if (currentLine) 
          lines.push(currentLine)
        
        const lineHeight = size * 0.45
        
        lines.forEach((line, idx) => {
          checkNewPage(lineHeight + 2)
          // Justify text (except last line)
          if (justify && 
              idx < lines.length - 1 &&
              lines.length > 1) {
            const wordsInLine = 
              line.split(' ')
            if (wordsInLine.length > 1) {
              const textWidth = 
                wordsInLine.join('').length * 
                avgCharWidth
              const totalSpaceWidth = 
                lineWidth - textWidth
              const spaceWidth = 
                totalSpaceWidth / 
                (wordsInLine.length - 1)
              let xPos = ml + indent
              wordsInLine.forEach(
                (w, wi) => {
                  doc.text(w, xPos, y)
                  xPos += w.length * 
                    avgCharWidth + spaceWidth
                })
            } else {
              doc.text(line, ml + indent, y)
            }
          } else {
            doc.text(line, ml + indent, y)
          }
          y += lineHeight
        })
      }

      const addSpace = (n = 4) => { 
        y += n 
      }

      const addClause = (num, title, text) => {
        checkNewPage(20)
        addSpace(3)
        writePara(num + '. ' + title + ':', 
          10.5, true, 0, false)
        addSpace(1)
        writePara(text, 10.5, false, 0, true)
      }

      const addBulletClause = (
        num, title, bullets) => {
        checkNewPage(20)
        addSpace(3)
        writePara(num + '. ' + title + ':', 
          10.5, true, 0, false)
        addSpace(1)
        bullets.forEach(bullet => {
          checkNewPage(8)
          // Bullet point
          doc.setFontSize(10.5)
          doc.setFont('helvetica', 'normal')
          doc.text('â¢', ml + 3, y)
          writePara(bullet, 10.5, 
            false, 10, true)
          addSpace(1)
        })
      }
      
      // Title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('RENT AGREEMENT', 
        pw / 2, y, { align: 'center' })
      y += 10

      // Opening para
      writePara(
        'This Rent Agreement is executed at ' +
        formData.propertyCity + ' on ' +
        startFmt + ' between',
        10.5, false, 0, false)
      addSpace(4)

      // LESSOR
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.text('LESSOR:', ml, y)
      y += 6
      
      doc.setFont('helvetica', 'normal')
      writePara(formData.landlordName, 
        10.5, true, 0, false)
      
      if (formData.landlordFatherName) {
        writePara(
          'S/o D/o W/o: ' + 
          formData.landlordFatherName,
          10.5, false, 0, false)
      }
      writePara(
        formData.landlordAddress || 
        formData.propertyAddress,
        10.5, false, 0, false)
      if (formData.landlordAadhaar) {
        writePara(
          'Aadhaar: ' + 
          formData.landlordAadhaar,
          10.5, false, 0, false)
      }
      if (formData.landlordPAN) {
        writePara(
          'PAN: ' + formData.landlordPAN,
          10.5, false, 0, false)
      }
      addSpace(4)

      // LESSEE
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.text('LESSEE:', ml, y)
      y += 6
      
      writePara(formData.tenantName, 
        10.5, true, 0, false)
      
      if (formData.tenantFatherName) {
        writePara(
          'S/o D/o W/o: ' + 
          formData.tenantFatherName,
          10.5, false, 0, false)
      }
      writePara(
        formData.tenantPermanentAddress ||
        'As per Aadhaar Card',
        10.5, false, 0, false)
      if (formData.tenantAadhaar) {
        writePara(
          'Aadhaar: ' + 
          formData.tenantAadhaar,
          10.5, false, 0, false)
      }
      if (formData.tenantPAN) {
        writePara(
          'PAN: ' + formData.tenantPAN,
          10.5, false, 0, false)
      }
      addSpace(5)

      // WHEREAS
      writePara(
        'WHEREAS the Lessor is the absolute ' +
        'owner of the residential premises ' +
        'situated at ' + 
        formData.propertyAddress + ', ' +
        formData.propertyCity + 
        ', Type: ' + formData.propertyType +
        ', Furnishing: ' + formData.furnished +
        (formData.floor 
          ? ', Floor: ' + formData.floor 
          : '') +
        ', Parking: ' + 
        formData.parkingIncluded + '.',
        10.5, false, 0, true)
      addSpace(3)

      writePara(
        'AND WHEREAS the Lessee has ' +
        'requested the Lessor to let out ' +
        'the said premises on rent and ' +
        'the Lessor has agreed to let the ' +
        'same on the terms and conditions ' +
        'hereinafter contained.',
        10.5, false, 0, true)
      addSpace(5)

      // NOW THIS AGREEMENT
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.text(
        'NOW THIS AGREEMENT WITNESSETH ' +
        'AS FOLLOWS:', ml, y)
      y += 7

      // Clauses
      addClause('1', 'Term of Lease',
        'The lease shall commence from ' +
        startFmt + ' and shall continue ' +
        'for a period of ' + 
        formData.duration + 
        ' months, terminating on ' + 
        endFmt + '.')

      addClause('2', 'Monthly Rent',
        'The Lessee shall pay monthly ' +
        'rent of Rs.' + 
        formData.monthlyRent + '/- ' +
        '(Rupees ' + numberToWords(
          parseInt(formData.monthlyRent)) +
        ' Only) payable on or before ' +
        'the ' + (formData.rentDueDate || '5') + 
        'th day of every month.')

      addClause('3', 'Security Deposit',
        'The Lessee has deposited with ' +
        'the Lessor a sum of Rs.' + 
        formData.securityDeposit + '/- ' +
        '(Rupees ' + numberToWords(
          parseInt(
            formData.securityDeposit)) +
        ' Only) as security deposit, ' +
        'which shall be refundable without ' +
        'interest after deducting any dues, ' +
        'damages, or outstanding amounts ' +
        'within 30 days of vacating ' +
        'the premises.')

      addClause('4', 
        'Electricity / Water / Gas',
        'The Lessee shall pay electricity ' +
        'charges ' + 
        (formData.electricityBill === 
          'Tenant' 
          ? 'as per actual consumption.' 
          : 'which are included in rent.') +
        ' Water charges shall be ' + 
        formData.waterBill + '. ' +
        'Gas charges shall be ' + 
        formData.gasBill + '. ' +
        'Maintenance charges shall be ' + 
        formData.maintenanceCharges + '.')

      addClause('5', 'Lock-in Period',
        'This lease shall be locked for ' +
        'a period of ' + 
        formData.lockInPeriod + 
        ' months from the commencement ' +
        'date. During this period, neither ' +
        'party shall terminate the lease ' +
        'except as provided in this agreement.')

      addClause('6', 'Notice Period',
        'After the lock-in period, either ' +
        'party may terminate this lease ' +
        'by giving ' + formData.noticePeriod +
        ' month written notice to the ' +
        'other party.')

      addClause('7', 'Use of Premises',
        'The Lessee shall use the premises ' +
        'only for residential purposes ' +
        'and shall not use the premises ' +
        'for any commercial or illegal ' +
        'activities.')

      addClause('8', 'Subletting',
        'The Lessee shall not sublet, ' +
        'assign, or part with possession ' +
        'of the premises or any part ' +
        'thereof without prior written ' +
        'consent of the Lessor. ' +
        'Subletting: ' + 
        formData.sublettingAllowed + '.')

      addClause('9', 
        'Maintenance and Repairs',
        'The Lessee shall keep the ' +
        'premises in good condition and ' +
        'shall be responsible for minor ' +
        'repairs and maintenance. The ' +
        'Lessor shall be responsible for ' +
        'major structural repairs.')

      addClause('10', 'Society Rules',
        'The Lessee shall abide by all ' +
        'society rules and regulations ' +
        'and shall not cause any nuisance ' +
        'to the neighbors. Pets are ' +
        (formData.petsAllowed === 'Yes'
          ? 'allowed.' 
          : 'not allowed.') +
        ' Smoking is ' +
        (formData.smokingAllowed === 'Yes'
          ? 'allowed inside the premises.'
          : 'not allowed inside ' +
            'the premises.'))

      addClause('11', 'Inspection Rights',
        'The Lessor or their authorized ' +
        'representative shall have the ' +
        'right to inspect the premises ' +
        'at any reasonable time after ' +
        'giving 24 hours prior notice ' +
        'to the Lessee.')

      addClause('12', 'Alterations',
        'The Lessee shall not make any ' +
        'structural alterations, additions, ' +
        'or modifications to the premises ' +
        'without prior written consent ' +
        'of the Lessor.')

      addClause('13', 
        'Vacating and Possession',
        'On termination of this lease, ' +
        'the Lessee shall vacate the ' +
        'premises and hand over peaceful ' +
        'possession to the Lessor in good ' +
        'condition, reasonable wear and ' +
        'tear excepted.')

      addClause('14', 'Default Clause',
        'If the Lessee fails to pay rent ' +
        'within 15 days of the due date ' +
        'or commits any breach of the ' +
        'terms herein, the Lessor shall ' +
        'be entitled to terminate this ' +
        'lease and take possession of ' +
        'the premises.')

      if (formData.additionalTerms) {
        addClause('15', 
          'Special Terms',
          formData.additionalTerms)
      }

      addSpace(6)

      // Closing
      checkNewPage(20)
      writePara(
        'IN WITNESS WHEREOF, the parties ' +
        'hereto have executed this Rent ' +
        'Agreement on the day, month and ' +
        'year first above written.',
        10.5, false, 0, true)
      addSpace(10)

      // Signatures
      checkNewPage(40)

      // LESSOR signature
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.text('LESSOR', ml, y)
      
      // LESSEE signature (right side)
      doc.text('LESSEE', pw - mr - 30, y)
      y += 15

      doc.setFont('helvetica', 'normal')
      doc.text(formData.landlordName, ml, y)
      doc.text(formData.tenantName, 
        pw - mr - 30, y)
      y += 15

      // Witnesses
      doc.setFontSize(10.5)
      doc.setFont('helvetica', 'bold')
      doc.text('WITNESSES:', ml, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      doc.text('1. Name: _______________', 
        ml, y)
      doc.text('2. Name: _______________', 
        ml + 95, y)
      y += 7
      doc.text('   Signature', ml, y)
      doc.text('   Signature', ml + 95, y)
      y += 12

      // Disclaimer
      checkNewPage(15)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(120, 120, 120)
      writePara(
        'This agreement is generated by ' +
        'RentShield (rental-shield-a4638' +
        '.web.app) for reference purposes ' +
        'only. Please execute on appropriate ' +
        'stamp paper and consult a legal ' +
        'professional for full legal validity.',
        8, false, 0, false)
      doc.setTextColor(0, 0, 0)
      
      // Legal warning
      checkNewPage(15)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      writePara(
        'By proceeding, you acknowledge that ' +
        'RentShield does not provide legal advice.',
        8, false, 0, false)
      doc.setTextColor(0, 0, 0)

      // Footer on all pages
      addFooter()

      // Fix total pages
      const total = 
        doc.internal.getNumberOfPages()
      for (let i = 1; i <= total; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        doc.text(
          'Page ' + i + ' of ' + total,
          pw / 2, ph - 10,
          { align: 'center' })
        doc.setTextColor(0, 0, 0)
      }

      // Save PDF
      const fn = 
        'RentShield_Agreement_' +
        formData.tenantName
          .replace(/\s+/g, '_') +
        '_' + formData.startDate + '.pdf'
      
      // Store blob for merging
      const pdfBlob = doc.output('blob')
      setGeneratedPdfBlob(pdfBlob)
      
      doc.save(fn)
      
      setSuccess(
        "Rent Agreement downloaded! " +
        "You can now upload your " +
        "e-stamp certificate below.")

    } catch (e) {
      console.error('PDF error:', e)
      setError('Failed to generate: ' + 
        e.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleMergeAndDownload = async () => {
    if (!eStampFile) {
      setError("Please upload e-stamp PDF")
      return
    }
    if (!generatedPdfBlob) {
      setError("Generate agreement first")
      return
    }

    setMerging(true)
    setError("")

    try {
      // Check PDFLib loaded
      console.log("window.PDFLib:", 
        typeof window.PDFLib)
      console.log("PDFLib keys:", 
        window.PDFLib 
          ? Object.keys(window.PDFLib) 
          : 'none')

      if (!window.PDFLib || 
          !window.PDFLib.PDFDocument) {
        throw new Error(
          "PDF merge library not loaded. " +
          "Refresh and try again.")
      }

      const { PDFDocument } = window.PDFLib

      // Read e-stamp as Uint8Array
      const eStampBytes = await new Promise(
        (resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(
            new Uint8Array(fr.result))
          fr.onerror = reject
          fr.readAsArrayBuffer(eStampFile)
        })
      console.log("E-stamp bytes read:", 
        eStampBytes.length)

      // Read agreement blob as Uint8Array
      const agreementBytes = await new Promise(
        (resolve, reject) => {
          const fr = new FileReader()
          fr.onload = () => resolve(
            new Uint8Array(fr.result))
          fr.onerror = reject
          fr.readAsArrayBuffer(generatedPdfBlob)
        })
      console.log("Agreement bytes read:", 
        agreementBytes.length)

      // Load both PDFs
      console.log("Loading e-stamp PDF...")
      const eStampPDF = await 
        PDFDocument.load(eStampBytes, {
          ignoreEncryption: true
        })
      console.log("E-stamp loaded, pages:", 
        eStampPDF.getPageCount())

      console.log("Loading agreement PDF...")
      const agreementPDF = await 
        PDFDocument.load(agreementBytes, {
          ignoreEncryption: true
        })
      console.log("Agreement loaded, pages:", 
        agreementPDF.getPageCount())

      // Create new merged PDF
      const merged = await PDFDocument.create()

      // Add e-stamp pages first
      const eStampIndices = Array.from(
        { length: eStampPDF.getPageCount() },
        (_, i) => i)
      const ePages = await merged.copyPages(
        eStampPDF, eStampIndices)
      ePages.forEach(p => merged.addPage(p))

      // Add agreement pages after
      const agIndices = Array.from(
        { length: agreementPDF.getPageCount() },
        (_, i) => i)
      const agPages = await merged.copyPages(
        agreementPDF, agIndices)
      agPages.forEach(p => merged.addPage(p))

      console.log("Total merged pages:", 
        merged.getPageCount())

      // Save and download
      const mergedBytes = await merged.save()
      const blob = new Blob([mergedBytes], {
        type: 'application/pdf'
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 
        'RentShield_Final_' + 
        formData.startDate + '.pdf'
      link.click()
      URL.revokeObjectURL(url)

      setSuccess(
        "Final agreement with e-stamp " +
        "downloaded! Print on stamp paper " +
        "and get signed.")

    } catch (e) {
      console.error("Merge error:", e)
      setError("Merge failed: " + e.message)
    } finally {
      setMerging(false)
    }
  }

  // Handle e-stamp file upload
  const handleEstampUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        setMergeError("Please upload a PDF, JPG, or PNG file.")
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setMergeError("File size must be less than 10MB.")
        return
      }

      setEStampFile(file)
      setMergeError("")
    }
  }

  // Helper: Number to words
  const numberToWords = (num) => {
    if (!num || isNaN(num)) return "Zero"
    const ones = ['', 'One', 'Two', 'Three',
      'Four', 'Five', 'Six', 'Seven', 'Eight',
      'Nine', 'Ten', 'Eleven', 'Twelve',
      'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen',
      'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty',
      'Forty', 'Fifty', 'Sixty', 'Seventy',
      'Eighty', 'Ninety']
    
    num = parseInt(num)
    if (num === 0) return "Zero"
    
    let words = []
    if (num >= 100) {
      words.push(ones[num % 100])
      num = Math.floor(num / 100)
    }
    
    if (num >= 20) {
      words.push(tens[Math.floor(num / 10)])
      num = num % 10
    }
    
    if (num > 0) {
      words.push(ones[num])
    }
    
    return words.join(' ')
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4} alignItems="center">
          <CircularProgress size={48} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading rental details...
          </Typography>
        </Stack>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4} alignItems="center">
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        </Stack>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {/* Success/Error Alerts */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {mergeError && (
            <Alert severity="error" onClose={() => setMergeError("")}>
              {mergeError}
            </Alert>
          )}

          {/* E-STAMP UPLOAD SECTION */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CloudUpload sx={{ color: '#1565C0' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Make Agreement Execution-Ready
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Upload your e-stamp certificate and merge it with your generated rent agreement for final printing and signatures.
                </Typography>
                
                <Box sx={{ border: '2px dashed #ccc', p: 3, borderRadius: 1, bgcolor: '#fafafa' }}>
                  <Stack spacing={3}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 2 }}>
                      Upload E-Stamp Certificate
                    </Typography>
                    
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleEstampUpload}
                      style={{ display: 'none' }}
                      id="estamp-upload"
                    />
                    <label htmlFor="estamp-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<Upload />}
                        fullWidth
                      >
                        {eStampFile ? eStampFile.name : 'Choose E-Stamp File (PDF, JPG, PNG)'}
                      </Button>
                    </label>
                    
                    {eStampFile && (
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label={`Selected: ${eStampFile.name}`}
                          onDelete={() => {
                            setEStampFile(null)
                            setMergeError("")
                          }}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    )}
                  </Stack>
                </Box>
                
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleMergeAndDownload}
                  disabled={!eStampFile || !generatedPdfBlob || merging}
                  startIcon={merging ? <CircularProgress size={20} /> : <CloudUpload />}
                  sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
                >
                  {merging ? 'Merging...' : 'Merge & Download Final Agreement'}
                </Button>
                  
                {eStampFile && (
                  <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
                    File: {eStampFile.name} | Size: {(eStampFile.size/1024).toFixed(1)} KB
                    {eStampFile.size < 5000 && (
                      <span style={{color:'red'}}> ⚠️ File too small - may not be valid PDF</span>
                    )}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* CARD 1: Landlord Details */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Person sx={{ color: '#1565C0' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Landlord Details
                  </Typography>
                </Stack>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Landlord Name"
                      value={formData.landlordName}
                      onChange={handleInputChange('landlordName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Father's Name"
                      value={formData.landlordFatherName}
                      onChange={handleInputChange('landlordFatherName')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={formData.landlordAddress}
                      onChange={handleInputChange('landlordAddress')}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Aadhaar Number"
                      value={formData.landlordAadhaar}
                      onChange={handleInputChange('landlordAadhaar')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="PAN Number"
                      value={formData.landlordPAN}
                      onChange={handleInputChange('landlordPAN')}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* CARD 2: Tenant Details */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Person sx={{ color: '#1565C0' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tenant Details
                  </Typography>
                </Stack>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Tenant Name"
                      value={formData.tenantName}
                      onChange={handleInputChange('tenantName')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Father's Name"
                      value={formData.tenantFatherName}
                      onChange={handleInputChange('tenantFatherName')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Permanent Address"
                      value={formData.tenantPermanentAddress}
                      onChange={handleInputChange('tenantPermanentAddress')}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Aadhaar Number"
                      value={formData.tenantAadhaar}
                      onChange={handleInputChange('tenantAadhaar')}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* CARD 3: Property Details */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Description sx={{ color: '#1565C0' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Property Details
                  </Typography>
                </Stack>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Property Address"
                      value={formData.propertyAddress}
                      onChange={handleInputChange('propertyAddress')}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={formData.propertyCity}
                      onChange={handleInputChange('propertyCity')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Property Type"
                      value={formData.propertyType}
                      onChange={handleInputChange('propertyType')}
                    >
                      <MenuItem value="1BHK">1BHK</MenuItem>
                      <MenuItem value="2BHK">2BHK</MenuItem>
                      <MenuItem value="3BHK">3BHK</MenuItem>
                      <MenuItem value="1RK">1RK</MenuItem>
                      <MenuItem value="Studio">Studio</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Furnishing"
                      value={formData.furnished}
                      onChange={handleInputChange('furnished')}
                    >
                      <MenuItem value="Unfurnished">Unfurnished</MenuItem>
                      <MenuItem value="Semi-Furnished">Semi-Furnished</MenuItem>
                      <MenuItem value="Fully-Furnished">Fully-Furnished</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Parking"
                      value={formData.parkingIncluded}
                      onChange={handleInputChange('parkingIncluded')}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Floor"
                      value={formData.floor}
                      onChange={handleInputChange('floor')}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* CARD 4: Financial Details */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <AttachMoney sx={{ color: '#1565C0' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Financial Details
                  </Typography>
                </Stack>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Monthly Rent (₹)"
                      value={formData.monthlyRent}
                      onChange={handleInputChange('monthlyRent')}
                      type="number"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Security Deposit (₹)"
                      value={formData.securityDeposit}
                      onChange={handleInputChange('securityDeposit')}
                      type="number"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Start Date"
                      value={formData.startDate}
                      onChange={handleInputChange('startDate')}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Pets Allowed"
                      value={formData.petsAllowed}
                      onChange={handleInputChange('petsAllowed')}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Subletting Allowed"
                      value={formData.sublettingAllowed}
                      onChange={handleInputChange('sublettingAllowed')}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Water Bill"
                      value={formData.waterBill}
                      onChange={handleInputChange('waterBill')}
                    >
                      <MenuItem value="Included in rent">Included in rent</MenuItem>
                      <MenuItem value="Tenant">Tenant</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Gas/LPG Bill"
                      value={formData.gasBill}
                      onChange={handleInputChange('gasBill')}
                    >
                      <MenuItem value="Tenant">Tenant</MenuItem>
                      <MenuItem value="Landlord">Landlord</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Maintenance Charges"
                      value={formData.maintenanceCharges}
                      onChange={handleInputChange('maintenanceCharges')}
                    >
                      <MenuItem value="Tenant">Tenant</MenuItem>
                      <MenuItem value="Landlord">Landlord</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <TextField
                      fullWidth
                      label="Additional Terms"
                      value={formData.additionalTerms}
                      onChange={handleInputChange('additionalTerms')}
                      multiline
                      rows={4}
                      placeholder="e.g. Society maintenance to be paid by tenant separately, guests allowed only with prior approval, etc."
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>

          {/* DISCLAIMER */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
              <Typography variant="body2">
                <strong>Legal Notice:</strong> RentShield prepares your agreement for execution. Please ensure correct stamp duty, signatures, witness signatures, and local legal compliance.
              </Typography>
            </Alert>
          </Box>

          {/* GENERATE BUTTON */}
          <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', p: 3, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={generatePDF}
              disabled={generating}
              startIcon={generating ? <CircularProgress size={20} /> : <Download />}
              sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
              {generating ? 'Generating...' : 'Generate & Download Agreement'}
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
