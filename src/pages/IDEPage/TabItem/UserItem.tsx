import { EditIcon } from '@chakra-ui/icons'
import { Avatar, Flex, IconButton, Spacer } from '@chakra-ui/react'
import { FiMic } from 'react-icons/fi'

interface Props {
  profile?: string
  nickname: string
  isMicAllow: boolean
  isEditAllow: boolean
}

// NOTE - profile(프로필 이미지) 필드 나중에 받아와야 함
const UserItem = ({ nickname, isMicAllow, isEditAllow }: Props) => {
  return (
    <Flex align="center">
      {/* TODO - profile 이미지 설정 */}
      <Avatar name="User" size="sm" src="https://bit.ly/dan-abramov" mr={1} />
      {nickname}
      <Spacer />
      <IconButton
        aria-label="add folder"
        size="xs"
        bgColor="transparent"
        icon={<FiMic />}
        fontSize="16px"
        color={isMicAllow ? 'green' : 'gray.300'}
      />
      <IconButton
        aria-label="add files"
        size="xs"
        bgColor="transparent"
        icon={<EditIcon />}
        fontSize="16px"
        color={isEditAllow ? 'green' : 'gray.300'}
      />
    </Flex>
  )
}

export default UserItem