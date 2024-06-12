import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Menu,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { FiFolderPlus } from 'react-icons/fi'
import { FiFilePlus } from 'react-icons/fi'
import { convertToTreeItems } from '@/utils/treeview'
import { IoLogoJavascript } from 'react-icons/io5'
import { FaJava } from 'react-icons/fa'
import { PiFileCpp } from 'react-icons/pi'
import { DiPython } from 'react-icons/di'
import { IoCodeSlashOutline } from 'react-icons/io5'
import { FaRegFolder, FaRegFolderOpen } from 'react-icons/fa'
import TreeView, { ITreeViewOnNodeSelectProps } from 'react-accessible-treeview'
import './treeview.css'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  selectEntries,
  selectEntry,
  setCurrentFileContent,
  setCurrentFileId,
  setEntries,
  setSelectedEntry,
} from '@/store/ideSlice'
import { useRef, useState } from 'react'
import {
  createDirectory,
  createFile,
  deleteDirectory,
  deleteFile,
  editDirectoryName,
  editFileName,
} from '@/services/entry'
// import { getFile } from '@/services/entry'

const Explorer = ({ containerId }: { containerId: string | undefined }) => {
  const entries = useAppSelector(selectEntries)

  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isMenuOpen,
    onOpen: onMenuOpen,
    onClose: onMenuClose,
  } = useDisclosure()
  const {
    isOpen: isEditNameModalOpen,
    onOpen: onEditNameModalOpen,
    onClose: onEditNameModalClose,
  } = useDisclosure()
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure()

  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const [contextClickElementId, setContextClickElementId] = useState(0)

  const dispatch = useAppDispatch()
  const selectedEntry = useAppSelector(selectEntry)

  const selectedTreeNodeRef = useRef<HTMLDivElement>(null)

  const [newEntryName, setNewEntryName] = useState('')
  const [newEntryType, setNewEntryType] = useState('')
  const [editEntryName, setEditEntryName] = useState('')
  const [isEditEntryDirectory, setIsEditEntryDirectory] = useState(false)

  const FolderIcon = ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <FaRegFolderOpen color="e8a87c" className="icon" />
    ) : (
      <FaRegFolder color="e8a87c" className="icon" />
    )

  const FileIcon = ({ filename }: { filename: string }) => {
    const extension = filename.slice(filename.lastIndexOf('.') + 1)
    switch (extension) {
      case 'js':
        return <IoLogoJavascript color="#ECC94B" className="icon" />
      case 'java':
        return <FaJava color="orange" className="icon" />
      case 'py':
        return <DiPython color="green" className="icon" />
      case 'cpp':
        return <PiFileCpp color="blue" className="icon" />
      case 'c':
        return <IoCodeSlashOutline color="gray" className="icon" />
      default:
        return <FolderIcon isOpen={false} />
    }
  }

  const onNodeSelect = async ({
    element,
    isBranch,
  }: ITreeViewOnNodeSelectProps) => {
    if (isBranch) {
      dispatch(
        setSelectedEntry({ type: 'directory', id: element.id as number })
      )
    } else {
      dispatch(setSelectedEntry({ type: 'file', id: element.id as number }))
      dispatch(setCurrentFileId(element.id as number))

      // 선택된 파일 가져와서 currentFileContent에 저장

      // const response = await getFile(containerId, element.id)

      // if (response.success && response.data) {
      //   dispatch(setCurrentFileContent(response.data.content))
      // }  else {
      //   console.log('Error fetching file', response.error)
      // }

      // NOTE - 테스트용 코드 내용
      dispatch(
        setCurrentFileContent(
          `지금 열린 파일은 ${containerId}번 컨테이너에 있는 ${element.id}번 파일입니다. `
        )
      )
    }
  }

  // 탐색기 중 파일 외부를 클릭하면 루트 디렉토리를 클릭한 것과 같다.
  const onRootDirectoryClick = () => {
    // 이전에 select 상태였던 노드를 deselect한 것처럼 보여주기
    selectedTreeNodeRef.current?.classList.remove('tree-node--selected')

    dispatch(setSelectedEntry({ type: 'directory', id: 1 }))
  }

  // 디렉토리 생성 버튼 클릭 이벤트 핸들러
  // 새 디렉토리 이름을 받는 모달 창을 띄운다.
  const createDirectoryButtonClick = () => {
    if (selectedEntry.type === 'file') {
      toast({
        title: '파일에 디렉토리를 생성할 수 없습니다.',
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } else {
      setNewEntryType('directory')
      onOpen()
    }
  }

  // 디렉토리 생성 모달
  const createNewDirectory = async () => {
    const response = await createDirectory(
      containerId!,
      selectedEntry.id,
      newEntryName
    )

    if (response.success && response.data) {
      const newEntries = [...entries, response.data]
      dispatch(setEntries(newEntries))

      toast({
        title: '디렉토리가 생성되었습니다.',
        position: 'top-right',
        colorScheme: 'green',
        duration: 3000,
        isClosable: true,
      })
    } else {
      toast({
        title: '디렉토리 생성 실패',
        description: response.error,
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 파일 생성 버튼 클릭 이벤트 핸들러
  // 새 파일 이름을 받는 모달 창을 띄운다.
  const createFileButtonClick = () => {
    setNewEntryType('file')
    onOpen()
  }

  // 파일 생성 모달
  const createNewFile = async () => {
    let parentDirectoryId

    if (selectedEntry.id === 1) {
      parentDirectoryId = 1
    }

    if (selectedEntry.type === 'file') {
      parentDirectoryId = entries?.find(
        entry => entry.parentId === selectedEntry.id
      )?.id
    } else {
      parentDirectoryId = selectedEntry.id
    }

    if (!parentDirectoryId) {
      console.log('No parent directory')
    }

    const response = await createFile(
      containerId!,
      parentDirectoryId!,
      newEntryName
    )

    if (response.success && response.data) {
      const newEntries = [...entries, response.data]
      dispatch(setEntries(newEntries))
      toast({
        title: '파일이 생성되었습니다.',
        position: 'top-right',
        colorScheme: 'green',
        duration: 3000,
        isClosable: true,
      })
    } else {
      toast({
        title: '파일 생성 실패',
        description: response.error,
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const modalClose = () => {
    onClose()
    setNewEntryName('')
  }

  // 마우스 우클릭 클릭 이벤트 핸들러
  // 메뉴 모달을 띄운다.
  const handleContextMenu = (e: any) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    onMenuOpen()
  }

  // 이름 수정 클릭 이벤트 핸들러
  // 이름 수정 모달을 띄운다.
  const handleEditName = () => {
    setEditEntryName(
      entries?.find(entry => entry.id === contextClickElementId)?.name!
    )
    onEditNameModalOpen()
  }

  // 파일/디렉토리 이름 수정
  const editName = async () => {
    if (
      entries?.find(entry => entry.id === contextClickElementId)!.name ===
      editEntryName
    ) {
      onEditNameModalClose()
      return
    }

    let response

    if (isEditEntryDirectory) {
      response = await editDirectoryName(
        containerId!,
        contextClickElementId,
        editEntryName
      )
    } else {
      response = await editFileName(
        containerId!,
        contextClickElementId,
        editEntryName
      )
    }

    if (response.success) {
      const newEntries = entries?.map(entry => {
        if (entry.id === contextClickElementId) {
          return { ...entry, name: editEntryName }
        }
        return entry
      })

      dispatch(setEntries(newEntries))
      onEditNameModalClose()
    } else {
      toast({
        title: '파일 이름 수정 실패',
        description: response.error,
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // 디렉토리/파일 삭제
  const deleteEntry = async () => {
    let response

    if (isEditEntryDirectory) {
      response = await deleteDirectory(containerId!, contextClickElementId)
    } else {
      response = await deleteFile(containerId!, contextClickElementId)
    }

    if (response.success) {
      const newEntries = entries.filter(
        entry =>
          entry.id !== contextClickElementId &&
          entry.parentId !== contextClickElementId
      )

      dispatch(setEntries(newEntries))
    } else {
      toast({
        title: '삭제 실패',
        description: response.error,
        position: 'top-right',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }

    onDeleteModalClose()
  }

  return (
    <>
      <Flex align="center">
        <Text fontSize="sm">탐색기</Text>
        <Spacer />
        <IconButton
          aria-label="add folder"
          size="xs"
          bgColor="transparent"
          icon={<FiFolderPlus />}
          fontSize="16px"
          onClick={createDirectoryButtonClick}
        />
        <IconButton
          aria-label="add files"
          size="xs"
          bgColor="transparent"
          icon={<FiFilePlus />}
          fontSize="16px"
          onClick={createFileButtonClick}
        />
      </Flex>
      <Flex className="directory" direction="column" minH="calc(100vh - 120px)">
        <TreeView
          data={convertToTreeItems(entries)}
          aria-label="directory tree"
          onNodeSelect={onNodeSelect}
          defaultExpandedIds={[2]}
          defaultSelectedIds={[3]}
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            getNodeProps,
            isSelected,
            level,
          }) => (
            <div
              {...getNodeProps()}
              style={{ paddingLeft: 20 * (level - 1) }}
              ref={isSelected ? selectedTreeNodeRef : null}
              onContextMenu={e => {
                handleContextMenu(e)
                setContextClickElementId(element.id as number)
                setIsEditEntryDirectory(isBranch)
              }}
            >
              {isBranch ? (
                <FolderIcon isOpen={isExpanded} />
              ) : (
                <FileIcon filename={element.name} />
              )}

              {element.name}
            </div>
          )}
        />
        <Box flexGrow={1} onClick={onRootDirectoryClick} />
      </Flex>

      {/* SECTION 디렉토리/파일 우클릭 시 나타나는 메뉴 */}
      <Menu isOpen={isMenuOpen} onClose={onMenuClose} isLazy>
        <MenuList
          style={{
            position: 'absolute',
            left: menuPosition.x,
            top: menuPosition.y,
          }}
          minW="120px"
        >
          <MenuItem fontSize="sm" onClick={handleEditName}>
            이름 수정
          </MenuItem>
          <MenuItem fontSize="sm" onClick={onDeleteModalOpen}>
            삭제
          </MenuItem>
        </MenuList>
      </Menu>

      {/* SECTION 디렉토리/파일 생성 모달 */}
      <Modal isOpen={isOpen} onClose={modalClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            {newEntryType === 'file' ? '파일 생성하기' : '디렉토리 생성하기'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold" mb={1}>
              이름
            </Text>
            <Input
              placeholder={`생성할 ${newEntryType === 'file' ? '파일' : '디렉토리'}의 이름을 입력해주세요.`}
              size="sm"
              borderRadius="md"
              mb={4}
              value={newEntryName}
              onChange={e => setNewEntryName(e.target.value)}
              isInvalid={newEntryName === ''}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={modalClose} size="sm">
              취소
            </Button>
            <Button
              variant="solid"
              colorScheme="green"
              size="sm"
              onClick={
                newEntryType === 'file' ? createNewFile : createNewDirectory
              }
            >
              생성
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* SECTION 디렉토리/파일 이름 수정 모달 */}
      <Modal
        isOpen={isEditNameModalOpen}
        onClose={onEditNameModalClose}
        isCentered
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            이름 수정
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              size="sm"
              borderRadius="md"
              mb={4}
              value={editEntryName}
              onChange={e => setEditEntryName(e.target.value)}
              isInvalid={editEntryName === ''}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={onEditNameModalClose}
              size="sm"
            >
              취소
            </Button>
            <Button
              variant="solid"
              colorScheme="green"
              size="sm"
              onClick={editName}
            >
              수정
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* SECTION 디렉토리/파일 삭제 확인 모달 */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        isCentered
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            정말로 삭제하시겠습니까?
          </ModalHeader>
          <ModalCloseButton />
          <ModalFooter>
            <Button
              colorScheme="gray"
              mr={3}
              onClick={onDeleteModalClose}
              size="sm"
            >
              취소
            </Button>
            <Button
              variant="solid"
              colorScheme="red"
              size="sm"
              onClick={deleteEntry}
            >
              삭제
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Explorer
